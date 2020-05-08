


const socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messageFormLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#message')


//TEMPLATES
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML 
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//OPTIONS
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

//SCROLLING 
const autoscroll = ()=>{
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of the message container
    const containerHeight = $messages.scrollHeight

    //how far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}


//LISTENING TO MESSAGE
socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


//LISTENING TO LOCATION
socket.on('location',(message)=>{
    console.log(message)
    const html = Mustache.render(locationTemplate,{
        username: message.username,
        url: message.url,
        createdAt: moment(message.createAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

//LISTENING TO ROOMDATA
socket.on('roomData', ({room , users})=>{
    const html = Mustache.render(sidebarTemplate,{
       room,
       users
    })
    document.querySelector('#sidebar').innerHTML = html
})

     
// SENDING MESSAGE
$messageForm.addEventListener('submit',(e)=>{
    
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error)=>{  

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()


        if(error){
            return console.log(error)
        }

        console.log('The message is delivered!')
    })
})

// SENDING LOCATION
$messageFormLocation.addEventListener('click',()=>{

    if(!navigator.geolocation){
        return alert('your browser does not support geocoding')
    }

    $messageFormLocation.setAttribute('disable','disable')

    navigator.geolocation.getCurrentPosition((position)=>{
    
        socket.emit('locationMessage',{
    
            latitude: position.coords.latitude,
    
            longitude: position.coords.longitude
    
        },()=>{
            $messageFormLocation.removeAttribute('disable')
            console.log('location delivered!')
        })
    })
})


socket.emit('join', {username, room}, (error)=>{
     if(error){
         alert(error)
         location.href ='/'
     }
})