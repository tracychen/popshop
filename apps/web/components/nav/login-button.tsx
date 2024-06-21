import { useLogin, usePrivy } from "@privy-io/react-auth";
import { Button } from "../ui/button";

export const LogInButton = ({ ...props }) => {
  const { ready, authenticated } = usePrivy();

  const { login } = useLogin({
    onComplete: (user) => {
      console.log("User logged in", user);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <Button
      className={props?.className}
      disabled={!ready || authenticated}
      onClick={login}
    >
      {props?.children || "Log In"}
    </Button>
  );
};
