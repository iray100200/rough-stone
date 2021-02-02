import Vue from 'vue'
import Example from './example'

new Vue({
  render () {
    return <div>
      This is a test application.
      <Example />
    </div>
  }
}).$mount('#app')