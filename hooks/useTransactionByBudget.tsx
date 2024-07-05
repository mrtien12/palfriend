import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useSession } from 'next-auth/react';
import { Transaction } from '@/types/transaction';

const useTransactionByBudget = (budgetId: string) => {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      // Handle unauthenticated state
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBudgetAndTransactions = async () => {
      if (!session?.user?.email || !budgetId) {
        return;
      }

      try {
        setLoading(true);
        // Fetch budget details
        const budgetRef = doc(db, 'users', session.user.email, 'budgets', budgetId);
        const budgetDoc = await getDoc(budgetRef);

        if (!budgetDoc.exists()) {
          setError('Budget not found');
          setLoading(false);
          return;
        }

        const budget = budgetDoc.data();

        if (!budget) {
          setError('Failed to fetch budget data');
          setLoading(false);
          return;
        }

        // Fetch transactions based on budget details
        const transactionsRef = collection(db, 'users', session.user.email, 'transactions');
        let transactionsQuery;

        const categoryParts = budget.category.split(' / ');
        if (categoryParts.length === 2) {
          // Query transactions with exact subcategory match
          transactionsQuery = query(
            transactionsRef,
            where('account', 'in', budget.accounts),
            where('date', '>=', budget.startDate.toDate()),  // Convert Firestore Timestamp to Date
            where('date', '<=', budget.endDate.toDate()),    // Convert Firestore Timestamp to Date
            where('category', '==', budget.category)
          );
        } else {
          // Query transactions with main category match
          transactionsQuery = query(
            transactionsRef,
            where('account', 'in', budget.accounts),
            where('date', '>=', budget.startDate.toDate()),  // Convert Firestore Timestamp to Date
            where('date', '<=', budget.endDate.toDate()),    // Convert Firestore Timestamp to Date
            where('category', '>=', budget.category),
            where('category', '<', budget.category + '\uf8ff')
          );
        }

        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactionsList: Transaction[] = [];
        transactionsSnapshot.forEach((doc) => {
          const data = doc.data();
          transactionsList.push({
                        id: doc.id,
                        type: doc.data().type,
                        category: doc.data().category,
                        memo: doc.data().memo,
                        date: doc.data().date.toDate(),
                        amount: doc.data().amount,
                        account: doc.data().account,
                        toAccount: doc.data().toAccount,
                        transferid: doc.data().transferid,
                        from: doc.data().from                    
        });  // Ensure type conformity
        });

        setTransactions(transactionsList);
      } catch (err) {
        setError('Failed to fetch transactions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgetAndTransactions();
  }, [session?.user?.email, budgetId]);

  return  transactions;
};

export default useTransactionByBudget;
