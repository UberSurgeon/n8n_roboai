import Workflowform from "./component/workflow";
import Loginform from "./component/login";
import Createapi from "./component/createapi";
import { useDispatch, useSelector } from "react-redux";

function App() {
  const dispatch = useDispatch();

  const disUser = useSelector(({ user }) => {
    return user;
  })


  return (
    <>
      <Loginform/>
      <Createapi/>
      <Workflowform/>
    </>
  )
}

export default App;
