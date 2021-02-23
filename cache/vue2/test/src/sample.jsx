import "./styles.css";

class Name extends React.Component {
  constructor (name, value) {
    console.log(name, value)
  }
  render () {
    return <div>123</div>
  }
}

export default function App(app) {
  const p = console.log

  const c = 123
  const d = "hi"

  p(c, app, c);
  
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <h3 onChange={this.handleChange} ok={handleOk}>I am ok</h3>
      <h3></h3>
      <h4 onClick={handleClick} />
      <Name />
    </div>
  )
}