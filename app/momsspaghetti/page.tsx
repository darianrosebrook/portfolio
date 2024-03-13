import { login, } from './actions'

export default function Page() {
  return (
    <form> 
      <button formAction={login}>Log in</button>
    </form>
  )
}
