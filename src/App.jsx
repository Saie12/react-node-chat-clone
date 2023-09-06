import { useState, useEffect, useRef } from 'react'
import { BiPlus, BiComment, BiUser, BiFace, BiSend } from 'react-icons/bi'

function App() {
  const [text, setText] = useState('')
  const [message, setMessage] = useState(null)
  const [previousChats, setPreviousChats] = useState([])
  const [currentTitle, setCurrentTitle] = useState(null)
  const [isResponseLoading, setIsResponseLoading] = useState(false)
  const [isRateLimitError, setIsRateLimitError] = useState(false)
  const scrollToLastItem = useRef(null)

  const createNewChat = () => {
    setMessage(null)
    setText('')
    setCurrentTitle(null)
  }

  const backToHistoryPrompt = (uniqueTitle) => {
    setCurrentTitle(uniqueTitle)
    setMessage(null)
    setText('')
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    if (!text) return

    const options = {
      method: 'POST',
      body: JSON.stringify({
        message: text,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }

    try {
      setIsResponseLoading(true)

      const response = await fetch('http://localhost:8000/completions', options)
      const data = await response.json()

      if (data.error) {
        setIsRateLimitError(true)
      } else {
        setIsRateLimitError(false)
      }

      if (!data.error) {
        setMessage(data.choices[0].message)
        setTimeout(() => {
          scrollToLastItem.current?.lastElementChild?.scrollIntoView({
            behavior: 'smooth',
          })
        }, 1)
        setTimeout(() => {
          setText('')
        }, 2)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsResponseLoading(false)
    }
  }

    useEffect(() => {
    if (!currentTitle && text && message) {
      setCurrentTitle(text)
    }

    if (currentTitle && text && message) {
      setPreviousChats((prevChats) => [
        ...prevChats,
        {
          title: currentTitle,
          role: 'user',
          content: text,
        },
        {
          title: currentTitle,
          role: message.role,
          content:
            message.content.charAt(0).toUpperCase() + message.content.slice(1),
        },
      ])
    }
  }, [message, currentTitle])

  const currentChat = previousChats.filter(
    (prevChat) => prevChat.title === currentTitle
  )
  const uniqueTitles = Array.from(
    new Set(previousChats.map((prevChat) => prevChat.title).reverse())
  )
