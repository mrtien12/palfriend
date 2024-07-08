import { Account } from '@/types/account';
import { Text } from '@mantine/core';
import { format } from 'date-fns';
import { IoCartOutline } from 'react-icons/io5';
import { MdInstallMobile, MdSendToMobile } from 'react-icons/md';

interface Top10NearestTransactionsProps {
  data: {
    account: string;
    amount: number;
    category: string;
    date: Date;
    from: any | undefined;
    id: string;
    memo: string;
    toAccount: any | undefined;
    transferid: string;
    type: string;
  }[];
  accounts: Account[];
}

const Top10NearestTransactions = ({
  data,
  accounts,
}: Top10NearestTransactionsProps) => {
  return (
    <>
      <Text size="lg" mb="md" style={{ fontWeight: 700, fontSize: '20px' }}>
        Danh sách giao dịch gần đây
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {data?.map((item) => {
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: '20px',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 20px',
                borderRadius: '10px 35px',
                border: '1px solid #ccc',
                boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
              >
                <div
                  style={{
                    padding: '10px',
                    width: '50px',
                    height: '50px',
                    borderRadius: '10px 20px',
                    backgroundColor:
                      item.type === '1'
                        ? '#34BE76'
                        : item.type === '2'
                        ? '#27A4F2'
                        : '#FF5555',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#fff',
                  }}
                >
                  {item.type === '1' ? (
                    <MdInstallMobile size={30} />
                  ) : item.type === '2' ? (
                    <MdSendToMobile size={30} />
                  ) : (
                    <IoCartOutline size={30} />
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '80px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '5px',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>
                        <span>
                          {accounts.find(
                            (account) => account.id === item.account
                          )?.name ?? 'Unknown Account'}
                        </span>
                        {item.type === '2' && (
                          <span>
                            {'->'}{' '}
                            {accounts.find(
                              (account) => account.id === item.toAccount
                            )?.name ?? 'Unknown Account'}
                          </span>
                        )}
                      </div>
                      <div>{item.category}</div>
                    </div>
                    <div>{item.memo}</div>
                  </div>
                  <div style={{ marginTop: 'auto' }}>
                    {format(item.date, 'dd/MM/yyyy HH:mm:ss')}
                  </div>
                </div>
              </div>
              <div
                style={{
                  color:
                    item.type === '1'
                      ? 'green'
                      : item.type === '2'
                      ? 'blue'
                      : 'red',
                }}
              >
                {item.type !== '1' ? '-' : '+'}{' '}
                {new Intl.NumberFormat().format(item.amount)} VNĐ
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Top10NearestTransactions;
