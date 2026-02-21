import { useMeals } from '../context/MealContext';

const Toast = () => {
  const { toast } = useMeals();

  if (!toast) return null;

  return <div className="toast">{toast}</div>;
};

export default Toast;
