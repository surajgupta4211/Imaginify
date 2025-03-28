'use client'

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import axios from "axios"

const Page = () => {

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [formError, setFormError] = useState("");

  const { toast } = useToast();
  const router = useRouter();

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,25}$/;
    return regex.test(password);
  };

  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const validateUsername = (username: string) => {
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(username);
  };

  const onSubmit = async () => {
    setFormError(""); // Clear previous form error messages

    // Validate fields
    if (!email || !username || !password) {
      setFormError("All fields are required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Invalid email format");
      return;
    }

    if (!validateUsername(username)) {
      setUsernameError("Username can only contain letters and numbers");
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError("Password must include uppercase, lowercase, numbers, and special characters.");
      return;
    }

    try {
      setIsSubmitting(true)
      const data = {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password
      }
      const res = await axios.post("/api/signup", data)

      toast({
        title: "Account created",
        description: "Sign in to use IMAGINIFY",
        variant: "default"
      })

      if (res.data) {
        router.replace("/signin")
      }

    } catch (error: any) {
      console.log(error.response.data)
      const errMsg = error.response.data.message
      toast({
        title: "Sign Up Failed",
        description: `${error.response.data.message}`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">IMAGINIFY</h1>
          <p className="mb-4">Sign up to enter IMAGINIFY</p>
        </div>

        {formError && (
          <div className="text-red-500 text-sm mb-4">{formError}</div>
        )}

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="email">Email :</Label>
          <Input type="email" id="email" placeholder="@email" onChange={(e) => setEmail(e.target.value)} />
          {emailError && <div className="text-red-500 text-sm">{emailError}</div>}
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="username">Username :</Label>
          <Input type="text" id="username" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
          {usernameError && <div className="text-red-500 text-sm">{usernameError}</div>}
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="password">Password :</Label>
          <Input
            type="password"
            id="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordError && <div className="text-red-500 text-sm">{passwordError}</div>}
        </div>

        <Button disabled={isSubmitting} onClick={onSubmit}>
          {
            isSubmitting ? <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            </> : ("Sign Up")
          }
        </Button>

        <div className="text-center mt-4">
          <p>
            Already have an account?
            <Link href="/signin" className="text-blue-600 hover:text-blue-800"> Sign In </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Page

