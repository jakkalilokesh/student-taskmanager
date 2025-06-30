import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { Amplify, Auth } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import './styles/App.css';

import awsconfig from './aws-exports';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Optimized Amplify configuration
const amplifyConfig = {
  ...awsconfig,
  Auth: {
    ...awsconfig.Auth,
    authenticationFlowType: 'USER_SRP_AUTH',
    cookieStorage: {
      domain: process.env.NODE_ENV === 'development' 
        ? 'localhost' 
        : window.location.hostname,
      path: '/',
      expires: 30,
      secure: process.env.NODE_ENV !== 'development'
    }
  }
};

Amplify.configure(amplifyConfig);

const AnimatedRoute = ({ children, animationType = 'fade' }) => {
  const animations = {
    fade: { 
      initial: { opacity: 0 }, 
      animate: { opacity: 1 }, 
      exit: { opacity: 0 } 
    },
    slideRight: { 
      initial: { x: 300, opacity: 0 }, 
      animate: { x: 0, opacity: 1 }, 
      exit: { x: -300, opacity: 0 } 
    },
    slideUp: { 
      initial: { y: 50, opacity: 0 }, 
      animate: { y: 0, opacity: 1 }, 
      exit: { y: -50, opacity: 0 } 
    },
    scale: { 
      initial: { scale: 0.9, opacity: 0 }, 
      animate: { scale: 1, opacity: 1 }, 
      exit: { scale: 0.9, opacity: 0 } 
    }
  };

  return (
    <motion.div
      initial={animations[animationType].initial}
      animate={animations[animationType].animate}
      exit={animations[animationType].exit}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

const AuthWrapper = ({ children }) => {
  const { route } = useAuthenticator();
  const [authChecked, setAuthChecked] = React.useState(false);
  const [authError, setAuthError] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;
    const authTimeout = setTimeout(() => {
      if (!authChecked && isMounted) {
        setAuthError(new Error('Authentication timeout'));
        setAuthChecked(true);
      }
    }, 8000); // 8 second timeout

    const checkAuth = async () => {
      try {
        await Auth.currentAuthenticatedUser();
        if (isMounted) {
          clearTimeout(authTimeout);
          setAuthChecked(true);
        }
      } catch (error) {
        if (isMounted) {
          clearTimeout(authTimeout);
          setAuthError(error);
          setAuthChecked(true);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      clearTimeout(authTimeout);
    };
  }, []);

  if (!authChecked) {
    return <LoadingSpinner fullScreen />;
  }

  if (route !== 'authenticated') {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const { signOut, user } = useAuthenticator();
  const [videoLoaded, setVideoLoaded] = React.useState(false);

  return (
    <div className="app-container">
      <video
        autoPlay
        loop
        muted
        playsInline
        className={`video-background ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoadedData={() => setVideoLoaded(true)}
        poster="https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.png"
      >
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4"
          type="video/mp4"
        />
      </video>

      <Navbar signOut={signOut} user={user} />

      <main className="page-container">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<AnimatedRoute><Dashboard /></AnimatedRoute>} />
            <Route path="/tasks" element={<AnimatedRoute><Tasks /></AnimatedRoute>} />
            <Route path="/calendar" element={<AnimatedRoute><Calendar /></AnimatedRoute>} />
            <Route path="/settings" element={<AnimatedRoute><Settings /></AnimatedRoute>} />
            <Route path="*" element={
              <AnimatedRoute>
                <div className="p-6 text-red-600 text-center">
                  404 - Page not found
                </div>
              </AnimatedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
};

const AuthPage = () => {
  const [authState, setAuthState] = React.useState(null);

  return (
    <div className="auth-page">
      <Authenticator
        loginMechanisms={['email']}
        signUpAttributes={['email']}
        services={{
          async handleSignIn(formData) {
            setAuthState('signingIn');
            try {
              return await Auth.signIn(formData.username, formData.password);
            } finally {
              setAuthState(null);
            }
          },
          async handleSignUp(formData) {
            setAuthState('signingUp');
            try {
              const { email, password } = formData;
              return await Auth.signUp({
                username: email,
                password,
                attributes: { email }
              });
            } finally {
              setAuthState(null);
            }
          }
        }}
        components={{
          Header: () => (
            <div className="auth-header">
              <h2>Student Task Manager</h2>
              <p>Please sign in to continue</p>
              {authState && (
                <div className="auth-progress">
                  <div className="auth-progress-bar"></div>
                </div>
              )}
            </div>
          ),
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/*" element={
          <AuthWrapper>
            <AppContent />
          </AuthWrapper>
        } />
      </Routes>
    </Router>
  );
}