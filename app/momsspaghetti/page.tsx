import { login, signOut } from './actions'

export default function LoginPage() {
  return (
    <form> 
      <button formAction={login}>Log in</button> 
      <button formAction={signOut}>Sign out</button>
    </form>
  )
}