import { Budget } from '@/types/budget';
import {
  ActionIcon,
  Group,
  Paper,
  Progress,
  Text,
  ThemeIcon,
  rem,
} from '@mantine/core';
import {
  IconEdit,
  IconEyeStar,
  IconSwimming,
  IconTrash,
} from '@tabler/icons-react';
import classes from './BudgetInfo.module.css';

interface BudgetInfoProps {
  budget: Budget;
  handleDelete: (id: string) => void;
  handleEdit: (id: string) => void;
  handleDetail: (id: string) => void;
}

export function BudgetInfo({
  budget,
  handleDelete,
  handleEdit,
  handleDetail,
}: BudgetInfoProps) {
  const percentage = (budget.currentAmount / budget.amount) * 100;

  return (
    <Paper radius="md" withBorder className={classes.card} mt={20}>
      <ThemeIcon className={classes.icon} size={60} radius={60}>
        <IconSwimming
          style={{ width: rem(32), height: rem(32) }}
          stroke={1.5}
        />
      </ThemeIcon>

      <Text ta="center" fw={700} className={classes.title}>
        {budget.name}
      </Text>

      <Group justify="space-between" mt="xs">
        <Text fz="sm" c="dimmed">
          {budget.startDate.toLocaleDateString()}
        </Text>
        <Text fz="sm" c="dimmed">
          {percentage.toFixed(2)} %
        </Text>
        <Text fz="sm" c="dimmed">
          {budget.endDate.toLocaleDateString()}
        </Text>
      </Group>

      <Progress
        value={percentage}
        animated={true}
        mt={5}
        color={percentage > 100 ? 'red' : 'blue'}
      />

      <Group justify="space-between" mt="md">
        <Text fz="sm">$0.00</Text>
        <Text fz="sm">${budget.amount}</Text>
      </Group>

      <Group justify="space-between">
        <Text>Số tiền còn lại: ${budget.amount - budget.currentAmount}</Text>
        <Group>
          <ActionIcon onClick={() => handleEdit(budget.id)}>
            <IconEdit />
          </ActionIcon>
          <ActionIcon onClick={() => handleDelete(budget.id)}>
            <IconTrash />
          </ActionIcon>

          <ActionIcon onClick={() => handleDetail(budget.id)}>
            <IconEyeStar />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
}
