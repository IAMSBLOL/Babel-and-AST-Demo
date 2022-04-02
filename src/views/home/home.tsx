import { useEffect } from 'react'

import './home.module.less'

const Home = (props: any): JSX.Element => {
  console.log(props)
  useEffect(() => {
    const set = new Set()
    console.log(set)
    function* gen () {
      yield 1
      yield 2
    }
    gen().next(2)
  }, [])

  const handleClick = () => {
    console.log(1)
  }
  return (
    <div styleName='home'>

      <div className='test1' onClick={handleClick} $trace="测试用例">测试JSX</div>
    </div>
  )
}

export default Home
