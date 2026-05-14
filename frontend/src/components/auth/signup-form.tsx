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

const signUpChema = z.object({
  firstname: z.string().min(1, "Tên bắt buộc phải có"),
  lastname: z.string().min(1, "Họ bắt buộc phải có"),
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  email: z.email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type SignUpFormValues = z.infer<typeof signUpChema>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signUp } = useAuthStore();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpChema),
  });

  const onSubmit = async (data: SignUpFormValues) => {
    const { firstname, lastname, username, email, password } = data;

    const success = await signUp(
      username,
      password,
      email,
      firstname,
      lastname,
    );

    if (success) {
      navigate("/signin");
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

                  <h1 className="text-2xl font-bold">Tạo tài khoản</h1>
                  <p className="text-muted-foreground text-balance">
                    Chào mừng bạn! Hãy đăng ký để bắt đầu
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="lastname" className="block text-sm">
                      Họ
                    </Label>
                    <Input
                      type="text"
                      id="lastname"
                      {...register("lastname")}
                    />
                    {errors.lastname && (
                      <p className="text-destructive text-sm">
                        {errors.lastname.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstname" className="block text-sm">
                      Tên
                    </Label>
                    <Input
                      type="text"
                      id="firstname"
                      {...register("firstname")}
                    />
                    {errors.firstname && (
                      <p className="text-destructive text-sm">
                        {errors.firstname.message}
                      </p>
                    )}
                  </div>
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
                  <Label htmlFor="email" className="block text-sm">
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="email@example.com"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <Label htmlFor="password" className="block text-sm">
                    Mật khẩu
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    {...register("password")}
                  />
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
                  Tạo tài khoản
                </Button>

                <OautGoogle />

                <div className="text-center text-sm">
                  Đã có tài khoản?{" "}
                  <a
                    href="/signin"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Đăng nhập
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
