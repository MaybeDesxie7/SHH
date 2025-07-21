export async function checkIfAdmin(supabase, user) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (error) return false;
  return data?.role === 'admin';
}
