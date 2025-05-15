<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const firstName = ref('')
const lastName = ref('')

const saveProfile = async () => {
  if (!firstName.value || !lastName.value) {
    return alert('Please fill all the fields')
  }

  const token = localStorage.getItem('token')
  const res = await fetch('https://soilsensebackend.onrender.com/profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      firstName: firstName.value,
      lastName: lastName.value
    })
  }).then(res => res.json())

  if (res.success) {
    router.push('/') 
  } else {
    alert(res.message)
  }
}
</script>

<template>
    <main>

        <header>
            <h1 class = "logo">SoilSense</h1>
            <h2>Profile</h2>
            <p>Complete your profile information</p>
        </header>

        <form @submit.prevent="saveProfile">
        <label>
            Nome:
            <input type="text" v-model="firstName" placeholder="Jonh" />
        </label>

        <label>
            Sobrenome:
            <input type="text" v-model="lastName" placeholder="Smith" />
        </label>

        <input
            type="submit" 
            value="save" />
    </form>

    </main>      
</template>

<style scoped>
main{
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    height: 100vh;
    background-color: var(--primary-dark);
    color: #F3F4F6;
}

header{
    padding: 1.5rem;
}

footer{
    background-color: #F3F4F6;
    width: 100%;
    color: var(--dark);
    text-align: center;
    padding: 1.5rem;
    padding-bottom: 3rem;
}

h2{
    font: 2.15rem;
    margin-bottom: 1rem;
}

h2 ~ p {
    font-weight: 500;
    font-size: 1rem;
} 

form{
    flex: 1 1 0%;
    display: block;
    border-radius: 1.5rem 1.5rem 0 0;
    background-color: #F3F4F6;
    box-shadow: 0px -4px 12px 4px rgba(0,0,0,0.16);
    color: var(--dark);
    padding: 4rem 1.5rem;
    width: 100%;
}

label{
    display: block;
    margin-bottom: 1.5rem;
}

label span{
    display: block;
    color: var(--blue);
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

input:not([type="submit"]) {
    display: block;
    width: 100%;
    border-radius: 0.5rem;
    padding: 1.5rem 1rem;
    font-size: 1rem;
    font-weight: 500;
    color: var(--dark);
    background-color: #F3F4F6;
}

input:not([type="submit"])::placeholder {
    color: var(--blue);
    font-style: italic;
}

input[type="submit"]{
    display: block;
    width: fit-content;
    margin: 0 auto;
    font-size: 1.5rem;
    font-weight: 500;
    color: #F3F4F6;
    background-color: var(--primary-dark);
    padding: 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: 0.2s ease;
}

input[type="submit"]:hover {
    background-color: var(--primary-dark);
}

</style>