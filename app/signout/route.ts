import { signOutAction } from '../ha/actions';

export async function GET() {
  await signOutAction();
}
