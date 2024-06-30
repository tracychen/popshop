import { useLogin, usePrivy } from "@privy-io/react-auth";

import { Button } from "@/components/ui/button";

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
    <Button {...props} disabled={!ready || authenticated} onClick={login}>
      {props?.children || "Log In"}
    </Button>
  );
};
