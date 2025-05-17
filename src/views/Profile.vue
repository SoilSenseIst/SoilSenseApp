<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

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
    const response = await fetch("http://localhost:3333/profile", {
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
      <h1 class="logo">SoilSense</h1>
      <h2>Profile</h2>
      <p></p>
    </header>

    <form @submit.prevent="Profile">
      <label>
        <span>Enter your first name</span>
        <input 
          type="text"
          v-model="first_name" 
          placeholder="John" />
      </label>

      <label>
        <span>Enter your last name</span>
        <input 
          type="text"
          v-model="last_name" 
          placeholder="Smith" />
      </label>

      <label>
        <span>Enter your device ID</span>
        <input 
          type="text"
          v-model="device_ID" 
          placeholder="device ID" />
      </label>

      <label>
        <span>Enter your device key</span>
        <input 
          type="text"
          v-model="device_key" 
          placeholder="device key" />
      </label>

      <input
        type="submit" 
        :value="loading ? 'Updating...' : 'Update'"
        :disabled="loading" />
    </form>
  </main>
</template>
