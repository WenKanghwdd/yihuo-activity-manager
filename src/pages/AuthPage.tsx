import { useState, useEffect } from 'react';
import { Mail, Lock, Loader2, AlertCircle, CheckCircle2, Shield, ArrowLeft, LogIn } from 'lucide-react';

export default function AuthPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 检查登录状态 + 检测密码重置链接
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
      setMode('reset');
      setLoading(false);
      return;
    }

    import('../supabaseAuthLazy').then(async (auth) => {
      const session = await auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const auth = await import('../supabaseAuthLazy');

    if (mode === 'login') {
      const { error: err } = await auth.signIn(email, password);
      if (err) {
        if (err.includes('Invalid login credentials')) setError('邮箱或密码错误');
        else if (err.includes('network') || err.includes('fetch')) setError('网络连接失败（请检查网络）');
        else setError(err);
      } else {
        // 登录成功，刷新用户信息
        const session = await auth.getSession();
        setUser(session?.user ?? null);
      }
    } else if (mode === 'signup') {
      const { error: err } = await auth.signUp(email, password);
      if (err) {
        if (err.includes('User already registered')) setError('该邮箱已注册，请直接登录');
        else if (err.includes('network') || err.includes('fetch')) setError('网络连接失败');
        else setError(err);
      } else {
        setSuccess('注册成功！如开启了邮箱验证请查收邮件');
        setMode('login');
      }
    } else if (mode === 'forgot') {
      const { error: err } = await auth.resetPassword(email);
      if (err) setError(err);
      else setSuccess('重置密码邮件已发送，请查收并按指引操作');
    } else if (mode === 'reset') {
      if (newPassword !== confirmPassword) {
        setError('两次密码不一致');
        setSubmitting(false);
        return;
      }
      if (newPassword.length < 6) {
        setError('密码至少 6 位');
        setSubmitting(false);
        return;
      }
      const { error: err } = await auth.updatePassword(newPassword);
      if (err) setError(err);
      else {
        setSuccess('密码已重置！请重新登录');
        setMode('login');
        setNewPassword('');
        setConfirmPassword('');
      }
    }
    setSubmitting(false);
  };

  const handleLogout = async () => {
    const auth = await import('../supabaseAuthLazy');
    await auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-warm-400 animate-spin" />
      </div>
    );
  }

  // 已登录 → 显示账号信息
  if (user && mode !== 'reset') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center bg-white rounded-xl border border-warm-100 p-8 max-w-sm w-full mx-4">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-lg font-bold text-warm-800 mb-1">已登录</h2>
          <p className="text-sm text-warm-500 mb-1 break-all">{user.email}</p>
          {user.user_metadata?.username && (
            <p className="text-xs text-warm-400 mb-4">用户名: {user.user_metadata.username}</p>
          )}
          <div className="flex gap-2 justify-center">
            <button onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              退出登录
            </button>
          </div>
          <p className="text-xs text-warm-400 mt-3">返回设置页可使用云同步</p>
        </div>
      </div>
    );
  }

  // 密码重置页面
  if (mode === 'reset') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-xl border border-warm-100 p-8 max-w-sm w-full mx-4 shadow-sm">
          <div className="text-center mb-6">
            <Shield className="w-10 h-10 text-warm-500 mx-auto" />
            <h1 className="text-xl font-bold text-warm-800 mt-3">设置新密码</h1>
          </div>

          {error && <ErrorBox msg={error} />}
          {success && <SuccessBox msg={success} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">新密码</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="至少 6 位" required minLength={6}
                className="w-full px-3 py-2.5 border border-warm-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-warm-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">确认新密码</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="再次输入" required minLength={6}
                className="w-full px-3 py-2.5 border border-warm-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-warm-400" />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7B68EE 0%, #E6A8D7 100%)' }}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '重置密码'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-xl border border-warm-100 p-8 max-w-sm w-full mx-4 shadow-sm">
        <div className="text-center mb-6">
          <img src="./logo.svg" alt="悦活" className="h-10 w-auto mx-auto" />
          <h1 className="text-xl font-bold text-warm-800 mt-3">
            {mode === 'login' ? '登录' : mode === 'signup' ? '注册' : '忘记密码'}
          </h1>
          <p className="text-sm text-warm-400 mt-1">
            {mode === 'forgot' ? '输入邮箱接收重置链接' : '悦活账号用于云端数据同步'}
          </p>
        </div>

        {error && <ErrorBox msg={error} />}
        {success && <SuccessBox msg={success} />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-1">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full pl-9 pr-3 py-2.5 border border-warm-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-warm-400" />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="至少 6 位" required minLength={6}
                  className="w-full pl-9 pr-3 py-2.5 border border-warm-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-warm-400" />
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting}
            className="w-full py-2.5 rounded-lg text-sm font-bold text-white transition-colors disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #7B68EE 0%, #E6A8D7 100%)' }}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> :
              mode === 'login' ? '登录' : mode === 'signup' ? '注册' : '发送重置邮件'}
          </button>
        </form>

        <div className="text-center mt-4 space-y-2">
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
            className="text-sm text-warm-500 hover:text-warm-700 transition-colors block w-full">
            {mode === 'login' ? '没有账号？点击注册' : mode === 'signup' ? '已有账号？点击登录' : '← 返回登录'}
          </button>
          {mode === 'login' && (
            <button onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
              className="text-xs text-warm-400 hover:text-warm-600 transition-colors">
              忘记密码？
            </button>
          )}
        </div>

        <p className="text-xs text-warm-400 text-center mt-4 leading-relaxed">
          登录后数据将同步到你的个人云端空间，不同账号数据完全隔离。
        </p>
      </div>
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg mb-4">
      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
      <p className="text-xs text-red-600">{msg}</p>
    </div>
  );
}

function SuccessBox({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 bg-green-50 border border-green-200 rounded-lg mb-4">
      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
      <p className="text-xs text-green-600">{msg}</p>
    </div>
  );
}
