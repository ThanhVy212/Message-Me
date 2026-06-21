import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate } from "react-router";
import OautGoogle from "./OautGoogle";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const signInChema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type SignInFormValues = z.infer<typeof signInChema>;

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signIn } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInChema),
  });

  const onSubmit = async (data: SignInFormValues) => {
    const { username, password } = data;
    const success = await signIn(username, password);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center px-4 py-6 min-h-0 sm:py-8 md:px-6",
        className,
      )}
      {...props}
    >
      <div className="flex w-full max-w-md flex-col gap-3">
        <Card className="w-full overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-7">
                <div className="flex flex-col items-center text-center gap-2">
                  <a href="/" className="mx-auto block w-fit text-center">
                    <img
                      src="/logo.png"
                      alt="logo"
                      className="w-20 h-20 object-contain"
                    />
                  </a>

                  <h1 className="text-2xl font-bold">Chào mừng quay lại</h1>
                  <p className="text-muted-foreground text-balance">
                    Đăng nhập vào tài khoản của bạn
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="username" className="block text-sm">
                    Tên đăng nhập
                  </Label>
                  <Input
                    type="text"
                    id="username"
                    placeholder="abc123"
                    {...register("username")}
                  />
                  {errors.username && (
                    <p className="text-destructive text-sm">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="password" className="block text-sm">
                    Mật khẩu
                  </Label>

                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="pr-10"
                      {...register("password")}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="text-destructive text-sm">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  Đăng nhập
                </Button>

                <OautGoogle />

                <div className="text-center text-sm">
                  Chưa có tài khoản?{" "}
                  <a
                    href="/signup"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Đăng ký
                  </a>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="px-1 text-center text-xs text-balance text-muted-foreground *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
          Bằng cách nhấn tiếp tục, bạn đồng ý với{" "}
          <a href="#">Điều khoản dịch vụ</a> và{" "}
          <a href="#">Chính sách bảo mật</a> của chúng tôi.
        </p>
      </div>
    </div>
  );
}
