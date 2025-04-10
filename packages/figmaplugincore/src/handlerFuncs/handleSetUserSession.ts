import { Session } from '@supabase/supabase-js';

export async function handleSetUserSession(data: Session | null) {
  figma.clientStorage.setAsync('userSession', data).catch((err) => {});
}
