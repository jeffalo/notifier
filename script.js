var messages = document.getElementById('messages')

var splash = document.getElementById('splash')

var count;

var sendNotifs = true

var usernames = ['jeffalo']

//load users from localstorage
var namelist = document.getElementById('namelist')


if(localStorage.getItem('usernames')){
  //yes usernames
  console.log(localStorage.getItem(usernames))
  usernames = JSON.parse(localStorage.getItem('usernames'))

  createNameList()

  if(!usernames.length == 0){
    document.getElementById('user_'+usernames[0]).classList.add('active')
  } else {
    messages.style.display = 'none'
    splash.style.display = 'block'
  }

} else {
  //no we must be sad
  console.log('i cry')
  //redirect to first login screen thing
  document.location.href = './first.html'
}

var username = usernames[0]



function switchToUser(name){
  username = name
  checkCount(name,true)
}

function createNameList(){
  namelist.innerHTML = '<li><a class="logo"href="./index.html">notifier</a></li>'
  usernames.forEach(username=>{
    var link = document.createElement('li')
    var actuallink = document.createElement('a')

    actuallink.innerText = username
  
    actuallink.href = '#'

    actuallink.id = 'user_'+username

    link.appendChild(actuallink)

    //link.classList.add('user')
    link.addEventListener('click',e=>{
      var elems = document.querySelectorAll("a");

      [].forEach.call(elems, function(el) {
          el.classList.remove("active");
      });
      actuallink.classList.add('active')
      switchToUser(username)
    })

    link.addEventListener('contextmenu', e=>{
      e.preventDefault()
      createContextMenu(e.pageX, e.pageY, username)
    })

    //var dot = document.createTextNode(' • ')

    //namelist.appendChild(dot)

    namelist.appendChild(link)
  })
  var add = document.createElement('li')
  var adda = document.createElement('a')

  adda.innerText = 'add (+)'

  adda.href = '#'

  add.addEventListener('click', e=>{
    askUsername()
  })

  add.appendChild(adda)

  namelist.appendChild(add)
}


function addUser(name){
  messages.style.display = 'block'

  splash.style.display = 'none'
  usernames.push(name)
  createNameList()
  switchToUser(name)
  document.getElementById('user_'+name).classList.add('active')
  localStorage.setItem('usernames',JSON.stringify(usernames))
  //im not sure why i did it this way but don't ask i was tired and i want to go bed
}

async function askUsername(){
  Swal.fire({
    title: 'what\'s your scratch username?',
    text:'don\'t worry this can be changed later',
    input: 'text',
    inputPlaceholder: 'jeffalo',
    inputValidator: (value) => {
      let re = new RegExp('^\\w+$')
      if (!value) {
        return 'You need to write something!'
      }
      if(value.length < 3){
        return 'Invalid length'
      }
      if(value.length > 20){
        return 'Invalid length'
      }
      if(!re.test(value)){
        return 'Invalid characters'
      }
    }
    }).then((result) => {
      if (result.value) {
          addUser(result.value)
        }
      })
}

function timeout() {
  setTimeout(function () {
      //check mesage count
      checkCount(username,false)
      timeout();
  }, 5000);
}

function checkCount(user, isUserSwitch){
  
  usernames.forEach(name=>{
    //var the_link = document.getElementById('user_'+name)
    //the_link.innerText = name+' (0)'

    fetch('https://fluffyscratch.hampton.pw/notifications/v2/'+name+'?avoidcache='+Math.random())
    .then(response => response.json())
    .then(data => {

      if(name == user){
        //they are selected user


        if(data.count == -1){ //prevent -1
          messages.innerHTML = 0
          document.title = 'notifier'
        } else {
          messages.innerHTML = data.count
          if(data.count == 0){
            document.title = 'notifier'
          } else {
            document.title = '('+data.count+') notifier'
          }
          favicon.badge(data.count);
        }

        //but still do the cool thing
        var link = document.getElementById('user_'+name)
        if(data.count == -1){
          link.innerText = name + ' (0)'
        } else {
          link.innerText = name + ' ('+data.count+')'
        }
        

        //add notifications later because they are a pain
        if(count < data.count && !isUserSwitch){
          console.log('new mesage')
          var options = {
            body: 'click here to open the messages page!',
            icon: './assets/icon.png'
          }

          if(sendNotifs == true){
            var notif = new Notification(data.count-count+' new messages!',options)
            notif.onclick = function(event) {
              event.preventDefault(); // prevent the browser from focusing the Notification's tab
              window.open('https://scratch.mit.edu/messages', '_blank');
            }
          }

        }
        count = data.count

      } else {
        //they are just a nobody
        console.log('a')

        var link = document.getElementById('user_'+name)

        if(data.count == -1){
          link.innerText = name + ' (0)'
        } else {
          link.innerText = name + ' ('+data.count+')'
        }
        
      }

    });
  })
}

function remove(user){
  var index = usernames.indexOf(user)
  usernames.splice(index, 1)
  createNameList()
  if(!usernames.length == 0){
    document.getElementById('user_'+usernames[0]).classList.add('active')
  } else {
    messages.style.display = 'none'
    splash.style.display = 'block'
  }
  switchToUser(usernames[0])

  swal.fire({
    title: user+' was deleted',
    showCancelButton: false,
    showConfirmButton: false,
    timer: 1500,
    toast: true,
    position: "top-right",
    icon: "success",
})   
localStorage.setItem('usernames',JSON.stringify(usernames))
}

function notifyMe(more, isUserSwitch) {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    if(!isUserSwitch){
      var notification = new Notification(more + ' new messages!');
    }
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        if(!isUserSwitch){
          var notification = new Notification(more + ' new messages!');
        }
      }
    });
  }

  // At last, if the user has denied notifications, and you 
  // want to be respectful there is no need to bother them any more.
}

//^^^^ MDN VERY COOL THANKS!!!!


//timeout()

//I DONT KNOW WHY THAT TIMEOUT IS COMMENTED OUT BUT IT WORKS SO I DONT WANT TO BREAK IT


checkCount(usernames[0], true)

function createContextMenu(x,y, username){
  var old_element = document.getElementById("context-menu");
  var new_element = old_element.cloneNode(true);
  old_element.parentNode.replaceChild(new_element, old_element);
 
   var contextDiv = document.getElementById('context-menu')
   contextDiv.style.top = y+"px"
   contextDiv.style.left = x+"px"
   contextDiv.style.display = 'block'
 
  var menuTitle = document.getElementById('menu-title')
 
  var renameBtn = document.getElementById('renameBtn')
  var deleteBtn = document.getElementById('deleteBtn')
 
  menuTitle.innerText = username
 
  renameBtn.addEventListener('click', e=> {
    askRename(username)
  })
 
  deleteBtn.addEventListener('click', e=> {
     remove(username)
  })
 
   window.addEventListener("click", e => {
      //console.log('a')
     var contextDiv = document.getElementById('context-menu')
     contextDiv.style.display = 'none'
  });
 }

 async function askRename(name){
  Swal.fire({
    title: 'what\'s your scratch username?',
    text:'don\'t worry this can be changed later',
    input: 'text',
    inputPlaceholder: 'jeffalo',
    inputValidator: (value) => {
      let re = new RegExp('^\\w+$')
      if (!value) {
        return 'You need to write something!'
      }
      if(value.length < 3){
        return 'Invalid length'
      }
      if(value.length > 20){
        return 'Invalid length'
      }
      if(!re.test(value)){
        return 'Invalid characters'
      }
    }
    }).then((result) => {
      if (result.value) {
          rename(name, result.value)
        }
      })
 }

 function rename(username, newname){
   var index = usernames.indexOf(username)
   usernames[index] = newname
   createNameList()
   switchToUser(newname)
   document.getElementById('user_'+newname).classList.add('active')
   localStorage.setItem('usernames',JSON.stringify(usernames))
   
 }

if(localStorage.getItem('notif')){
  document.getElementById('check').checked = (localStorage.getItem('notif')=='true')
  sendNotifs = (localStorage.getItem('notif')=='true')
} else {
  localStorage.setItem('notif', true)
  document.getElementById('check').checked = true
  sendNotifs = true
}


function updateNotifs(){
  sendNotifs = document.getElementById('check').checked
  localStorage.setItem('notif', sendNotifs)
}

function openMsg(){
  window.open('https://scratch.mit.edu/messages', '_blank')
}

timeout()


//favicon

var favicon=new Favico({
  animation:'none'
});