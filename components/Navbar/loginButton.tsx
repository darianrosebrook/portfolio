import { login } from 'app/ha/actions';

export default function LoginButton() {
  return (
    <form>
      <button formAction={login}>Login</button>
    </form>
  );
}
