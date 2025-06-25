import AuthForm from '../components/AuthForm';
import AnimatedBackground from '../components/AnimatedBackground';

export default function Register() {
  return (
    <AnimatedBackground>
      <div className="flex items-center justify-center min-h-screen w-full px-4">
        <div className="glass-effect p-6 sm:p-8 w-full max-w-2xl mx-auto">
          <AuthForm mode="register" />
        </div>
      </div>
    </AnimatedBackground>
  );
}