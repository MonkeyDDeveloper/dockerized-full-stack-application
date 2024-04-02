<script lang="ts" setup>

    definePageMeta({

        middleware: 'auth'

    })

</script>
<template>

    <UContainer class="mt-4 p-4">

        <UButton to="/" color="blue" label="⬅️ Index" class="justify-center" />

    </UContainer>

    <UContainer class="p-4 grid grid-cols-1 grid-rows-2 gap-1">

        <UContainer class="w-full p-4 py-8 bg-blue-500 rounded-xl">
            <UButton color="teal" variant="link" to="/products" class="text-white font-extrabold w-full justify-center text-4xl" label="All products" />                
        </UContainer>
        <UContainer class="w-full p-4 py-8 bg-blue-600 rounded-xl">
            <UButton color="teal" variant="link" to="/products/addProduct" class="text-white font-extrabold w-full justify-center text-4xl" label="Create product" />                
        </UContainer>

    </UContainer>

</template>