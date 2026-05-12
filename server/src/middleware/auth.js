const supabase = require('../supabase');

module.exports = async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Find or create user record
  let { data: dbUser } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (!dbUser) {
    const { data: newUser } = await supabase
      .from('users')
      .insert({
        auth_id: user.id,
        name: user.user_metadata?.name || user.email.split('@')[0],
        email: user.email,
        phone: '',
        start_date: new Date().toISOString().split('T')[0],
        injury_mode: false,
        reminder_time: '20:00',
      })
      .select()
      .single();
    dbUser = newUser;
  }

  req.authUser = user;
  req.userId = dbUser.id;
  req.dbUser = dbUser;
  next();
};
