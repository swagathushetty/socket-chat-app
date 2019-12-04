const socket = io()

//elements
const $messageForm=document.querySelector('#message-form') //$sign not compulsory just convention
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $locationButton=document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


//templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML


//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoScroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message', (message) => {
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })

    //this will be adding <div>this is a message</div> everytime we send a message
    $messages.insertAdjacentHTML('beforeend',html) //beforeend will render new things at bottom of div
    autoScroll()
})



socket.on('locationMessage',(message)=>{
    console.log(message.url)
    const html=Mustache.render(locationTemplate,{
        url:message.url,
        username:message.username,
        createdAt:moment(message.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})


socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room:room,
        users:users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    //disable button
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message,(error)=>{

        //enable button after sending message
        //make input to empty button is enabled again
        //move pointer to input using focus
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('message')
    })
})  




$locationButton.addEventListener('click',()=>{

    $locationButton.setAttribute('disabled', 'disabled')

   if(!navigator.geolocation){
       return alert('geolocation is not supported by your browser')
   }

   navigator.geolocation.getCurrentPosition((position)=>{
       socket.emit('sendLocation', {
           latitude:position.coords.latitude,
           longitude:position.coords.longitude
       }, () => {
           console.log('location sent !!!')
             $locationButton.removeAttribute('disabled')
       })
   })

})


socket.emit('join',{username,room},(error)=>{

})