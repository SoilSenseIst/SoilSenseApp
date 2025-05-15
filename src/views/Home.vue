<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const logout = async () => {
    const sessionToken = localStorage.getItem('session_token');

    if (!sessionToken) {
        alert("No session token found.");
        return;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            session_token: sessionToken
        })
    }).then(res => res.json());

    if (res.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('session_token');
        router.push('/login');
    } else {
        alert(res.message);
    }
};

</script>

<template>
    <main>
        <h1>Hello, world</h1>
        <button @click="logout">Logout</button>
    </main>      
</template>

<style scoped>
main {
    padding: 1.5rem;
}

h1 {
    margin-bottom: 1rem;
}
</style>

