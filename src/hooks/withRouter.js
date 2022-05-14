import { useNavigate } from "react-router-dom"

const withRouter = (Component) => {
    const Wrapper = (props) => {
      const history = useNavigate()
      return (
        <Component
          history={history}
          {...props}
          />
      )
    }
    
    return Wrapper
}


export default withRouter