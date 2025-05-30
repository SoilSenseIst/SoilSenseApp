<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import logo from './logo.png';

const router = useRouter();

const first_name = ref("");
const last_name = ref("");
const device_ID = ref("");
const device_key = ref("");
const loading = ref(false);
const session_token = ref("");


onMounted(() => {
  session_token.value = localStorage.getItem("session_token");
});


const Profile = async () => {
  if (!first_name.value || !last_name.value || !device_ID.value || !device_key.value) {
    alert("Please fill all the fields.");
    return;
  }

  if (!session_token.value) {
    alert("Session token is missing. Please login again.");
    return;
  }

  loading.value = true;

  try {
    const response = await fetch("https://soilsenseserver.onrender.com/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_token: session_token.value,
        first_name: first_name.value,
        last_name: last_name.value,
        device_ID: device_ID.value,
        device_key: device_key.value,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("Erro do backend:", errData);
      throw new Error("Profile update failed.");
    }

    const data = await response.json();
    localStorage.setItem("first_name", first_name.value);
    localStorage.setItem("last_name", last_name.value);
    localStorage.setItem("device_ID", device_ID.value);
    localStorage.setItem("device_key", device_key.value);
    alert("Perfil atualizado com sucesso!");
    router.push("/Connect");

  } catch (error) {
    console.error("Falha na atualização:", error);
    alert("Algo deu errado. Tente novamente.");
  } finally {
    loading.value = false;
  }
};
</script>


<template>
  <main>
    <header>
      <img :src="logo" alt="SoilSense Logo" class="logo-img" />
      <h2>Profile</h2>
      <p></p>
    </header>

    <form @submit.prevent="Profile">
      <label>
        <span>Enter your first name</span>
        <box>
          <input 
          type="text"
          v-model="first_name" 
          placeholder="John" />
        </box>
      </label>

      <label>
        <span>Enter your last name</span>
        <box>
          <input 
          type="text"
          v-model="last_name" 
          placeholder="Smith" />
        </box>
      </label>

      <label>
        <span>Enter your device ID</span>
        <box>
          <input 
          type="text"
          v-model="device_ID" 
          placeholder="device ID" />
        </box>
      </label>

      <label>
        <span>Enter your device key</span>
        <box>
          <input 
          type="text"
          v-model="device_key" 
          placeholder="device key" />
        </box>
      </label>
      
      <input
        type="submit" 
        :value="loading ? 'Updating...' : 'Update'"
        :disabled="loading" />
    </form>
  </main>
</template>


<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background-color: var(--primary-dark);
  color: #F3F4F6;
  padding: 2rem;
}

header {
  padding: 1.5rem;
}

h2 {
  font: 2.15rem;
  margin-top: 1rem;
}

h2 ~ p {
  font-weight: 500;
  font-size: 1rem;
}     

form {
  flex: 1 1 0%;
  display: block;
  border-radius: 1.5rem 1.5rem 0 0;
  background-color: #F3F4F6;
  box-shadow: 0px -4px 12px 4px rgba(0,0,0,0.16);
  color: var(--dark);
  padding: 4rem 1.5rem;
  width: 100%;
}

label {
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

label box{
    display: block;
    color: var(--blue);
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 1rem;
    border-radius: 1.5rem 1.5rem 1.5rem 1.5rem;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
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

input[type="submit"] {
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
