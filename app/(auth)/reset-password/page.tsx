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

  const { toast } = useToast();
  const router = useRouter();

  // ✅ Password strength validator
  const isStrongPassword = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,25}$/;
    return regex.test(pass);
  };

  const onSubmit = async () => {
    // ✅ Validate before hitting API
    if (!email || !username || !password) {
      toast({
        title: "Missing Fields",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    if (!isStrongPassword(password)) {
      toast({
        title: "Weak Password",
        description: "Password must include uppercase, lowercase, numbers, and special characters",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const data = {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password,
      };

      const res = await axios.post("/api/reset-password", data);

      toast({
        title: "Password Reset Successfully",
        description: "Use new password to sign in",
        variant: "default"
      });

      if (res.data) {
        router.replace("/signin");
      }
    } catch (error: any) {
      console.log(error.response?.data);
      toast({
        title: "Reset Failed",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">IMAGINIFY</h1>
          <p className="mb-4">Reset your password</p>
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="email">Email :</Label>
          <Input type="email" id="email" placeholder="@email (Must Be Unique)" onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="username">Username :</Label>
          <Input type="text" id="username" placeholder="Username (only contain letters,numbers)" onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="password">New password :  </Label>
          <Input type="password" id="password" placeholder="Password (uppercase,lowercase,numbers,special characters)" onChange={(e) => setPassword(e.target.value)} />
        </div>

        <Button disabled={isSubmitting} onClick={onSubmit}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset password"}
        </Button>

        <div className="text-center mt-4">
          <p>
            Already have account?
            <Link href="/signin" className="text-blue-600 hover:text-blue-800"> Sign In </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;

