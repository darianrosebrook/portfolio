import { login } from '@/app/ha/actions';
import Button from '../../components/Button';

export default function LoginButton() {
  return (
    <form>
      <Button formAction={login}>Login</Button>
    </form>
  );
}
