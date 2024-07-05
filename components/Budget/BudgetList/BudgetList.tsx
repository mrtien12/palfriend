import { Budget } from '@/types/budget';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { BudgetInfo } from '../BudgetInfo/BudgetInfo';
interface BudgetListProps {
  budgets: Budget[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onDetail: (id: string) => void;
}

export default function BudgetList({
  budgets,
  onDelete,
  onEdit,
  onDetail,
}: BudgetListProps) {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const handleDelete = (id: string) => {
    onDelete(id);
  };

  const handleEdit = (id: string) => {
    onEdit(id);
  };

  const handleDetail = (id: string) => {
    onDetail(id);
  };

  const rows = budgets.map((budget) => (
    <BudgetInfo
      key={budget.id}
      budget={budget}
      handleDelete={handleDelete}
      handleEdit={handleEdit}
      handleDetail={handleDetail}
    />
  ));

  return <>{rows}</>;
}
