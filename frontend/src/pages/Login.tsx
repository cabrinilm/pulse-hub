import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AnimatedBackground from "../components/AnimatedBackground";
import Button from "../components/Button";
import { motion, AnimatePresence } from "framer-motion";
import LoginHeader from "../components/LoginHeader";
import Lottie from "lottie-react";
import unlockAnimation from "../lottie/Unlock_lottie.json";
import emailVerificationAnimation from "../lottie/emailverification_lottie.json";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const errorMessages: { [key: string]: string } = {
    "missing email or phone": "Missing email or password",
    "Invalid login credentials": "Invalid email or password",
    "User already registered": "User already registered",
    "Email not confirmed": "Please confirm your email before logging in",
    "Too many requests": "Too many attempts – try again in a few minutes",
    default: "Authentication error. Please try again.",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isForgotPassword) {
        await resetPassword(email);
        setIsEmailSent(true);
        setTimeout(() => navigate("/", { replace: true }), 3000);
        return;
      }

      if (isSignup) {
        await signUp(email, password, username);
      } else {
        await signIn(email, password);
      }

      setIsSuccess(true);
      setTimeout(() => navigate("/", { replace: true }), 3000);
    } catch (err: any) {
      const customError = errorMessages[err.message] || errorMessages.default;
      setError(customError);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <AnimatedBackground />
      <LoginHeader onToggleSignup={(value) => setIsSignup(value)} />

      <div className="flex flex-1 items-center justify-center px-4 sm:px-0">
        {!isSuccess && !isEmailSent && (
          <div className="relative z-10 w-full max-w-md bg-white/30 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col gap-4">
            <motion.h2
              className="text-3xl font-bold text-white text-center mb-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
            >
              {isForgotPassword
                ? "Reset Password"
                : isSignup
                  ? "Sign Up"
                  : "Login"}
            </motion.h2>

            <AnimatePresence mode="wait">
              <motion.form
                key={
                  isForgotPassword ? "forgot" : isSignup ? "signup" : "login"
                }
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 w-full"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {isSignup && (
                  <motion.input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="p-3 border border-white/40 rounded-xl w-full bg-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                  />
                )}

                <motion.input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="p-3 border border-white/40 rounded-xl w-full bg-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                />

                {!isForgotPassword && (
                  <motion.input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="p-3 border border-white/40 rounded-xl w-full bg-white/20 text-white placeholder-white/70 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors"
                  />
                )}

                {error && (
                  <p className="text-red-400 text-sm mt-1 text-center">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-3 rounded-xl w-full font-medium transition-all cursor-pointer"
                >
                  {isForgotPassword
                    ? "Send reset link"
                    : isSignup
                      ? "Sign Up"
                      : "Login"}
                </Button>
              </motion.form>
            </AnimatePresence>

            {!isForgotPassword && !isSignup && (
              <motion.button
                onClick={() => setIsForgotPassword(true)}
                className="text-white/70 hover:text-white hover:underline text-sm self-center transition-colors cursor-pointer"
              >
                Forgot your password?
              </motion.button>
            )}

            {isForgotPassword && (
              <motion.button
                onClick={() => setIsForgotPassword(false)}
                className="text-white/70 hover:text-white hover:underline text-sm self-center transition-colors cursor-pointer"
              >
                Back to login
              </motion.button>
            )}

            {!isForgotPassword && (
              <motion.button
                onClick={() => setIsSignup(!isSignup)}
                className="mt-2 text-white/80 hover:text-white hover:underline font-medium transition-colors self-center cursor-pointer"
              >
                {isSignup
                  ? "Already have an account? Login"
                  : "Create a new account"}
              </motion.button>
            )}
          </div>
        )}

        {(isSuccess || isEmailSent) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-72 h-72 flex flex-col items-center">
              <Lottie
                animationData={
                  isEmailSent ? emailVerificationAnimation : unlockAnimation
                }
                loop={false}
              />
              {isEmailSent && (
                <p className="text-white text-center mt-2">
                  Check your email for the reset link!
                </p>
              )}
              {isSuccess && (
                <p className="text-white text-center mt-2">
                  Welcome! Redirecting...
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
