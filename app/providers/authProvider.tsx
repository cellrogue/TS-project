"use client";

import { auth, db } from "@/firebase.config";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  updateProfile,
  UserCredential,
} from "firebase/auth";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import { User } from "../types/user";
import { doc, getDoc } from "firebase/firestore";

type AuthValues = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};
type AuthContextType = {
  user: User | null;
  authLoaded: boolean;
  register: (values: AuthValues) => Promise<string | void>;
  login: (values: AuthValues) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState<boolean>(false);

  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (_user) => {

      if (_user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', _user.uid));
          console.log("Fetched user document:", userDoc); 

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            console.log("User data from document:", userData); 

            const user = {
              id: _user.uid,
              username: _user.displayName || "",
              name: userData.name || "",
              email: _user.email || "",
              password: "",
              isModerator: userData.isModerator || false,
            };
            setUser(user);
            console.log("User set in state:", user); 
          } else {
            console.error("No such document!");
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setAuthLoaded(true);
    }, (error) => {
      console.error("Error with onAuthStateChanged:", error);
    });

    return () => unsub();
  }, []);

  console.log("user:", user?.username);

  const register = async (values: AuthValues): Promise<string | void> => {
    const toastId = toast.loading("Creating account...");

    try {
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );

      if (!userCredential.user) {
        throw new Error("Something went wrong!. Please try again.");
      }
      console.log(userCredential);

      await updateProfile(userCredential.user, {
        displayName: `${values.firstName} ${values.lastName}`,
      });

      setUser(user);

      toast.success("Account created successfully", { id: toastId });

      return userCredential.user.uid;
    } catch (error: any) {
      console.log(error.message);
      console.log(error.code);
      const message = error.code.split("/")[1].replace(/-/g, " ");
      toast.error(message || error.message, { id: toastId });
    }
  };

  const login = async (values: AuthValues): Promise<void> => {
    const toastId = toast.loading("Signing in...");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      if (!userCredential.user) {
        throw new Error("Something went wrong!. Please try again.");
      }
      console.log(userCredential);
      const token = await userCredential.user.getIdToken();
      console.log("token:", token);

      toast.success("Logged in successfully", { id: toastId });
    } catch (error: any) {
      console.log(error.message);
      const message = error.code.split("/")[1].replace(/-/g, " ");
      toast.error(message || error.message, { id: toastId });
    }
  };

  const value = {
    user,
    authLoaded,
    register,
    login,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContextProvider;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within an AuthContextProvider");
  return context;
};
