import { auth, provider, signInWithPopup } from "@libs/firebaseConfig";
import { useDispatch } from "react-redux";
import AuthActions from "../../../redux/auth/actions";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import * as Routers from "../../../utils/Routes";
import { clearToken } from "@utils/handleToken";
import Utils from "@utils/Utils";
import { showToast } from "@components/ToastContainer";
const GoogleLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      dispatch({
        type: AuthActions.LOGIN_GOOGLE,
        payload: {
          data: { tokenId: idToken },
          onSuccess: (user) => {
            if (user.isLocked) {
              navigate(Routers.BannedPage, {
                state: {
                  reasonLocked: user.reasonLocked,
                  dateLocked: Utils.getDate(user.dateLocked, 4),
                },
              });
              dispatch({ type: AuthActions.LOGOUT });
              clearToken();
            } else {
              navigate(Routers.Home, {
                state: { message: "Login account successfully!" },
              });
            }
          },
          onFailed: (msg) => {
            showToast.warning(msg);
          },
          onError: (error) => {
            showToast.error(error);
          },
        },
      });
    } catch (error) {
      console.error("Google Login Error:", error);
    }
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      variant="outline-success"
      className="w-100 mb-3 py-2 d-flex align-items-center justify-content-center"
    >
      <img
        src="https://cdn.pixabay.com/photo/2016/04/13/14/27/google-chrome-1326908_640.png"
        alt="Google"
        style={{ width: "20px", marginRight: "10px" }}
      />
      Continue with Google
    </Button>
  );
};

export default GoogleLogin;
