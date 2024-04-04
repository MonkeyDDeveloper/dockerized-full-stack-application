<template>
    <section class="">
      <UContainer class="mt-4">
        <h1 class="text-2xl font-extrabold">Product management system with docker containers</h1>
      </UContainer>

      <UContainer v-if="isAuth" class="mt-4 p-4">

        <UButton to="/dashboard" color="blue" label="Go to products ➡️" class="w-full justify-center" />

      </UContainer>

      <UContainer v-else class="mt-4">

        <UForm :state="state" :schema="schema" class="p-1" @submit="onSubmit">

            <UFormGroup label="Email" name="email" class="mb-4">
                <UInput type="email" v-model="state.email"></UInput>
            </UFormGroup>

            <UFormGroup label="Password" name="password" class="mb-4">
                <UInput type="password" v-model="state.password"></UInput>
            </UFormGroup>

            
            <UButton color="cyan" label="Log in" class="w-full justify-center" type="submit" />

        </UForm>

        </UContainer>

    </section>
</template>
<script lang="ts" setup>

    import { z } from "zod"
    import { reactive } from "vue";
    import type { FormSubmitEvent} from "#ui/types"

    const runtimeConfig = useRuntimeConfig();
    const { BACK_API_PORT = 5600 } = runtimeConfig.public

    console.log({BACK_API_PORT})

    const sessionToken = useCookie("sessionToken", {default: () => ""})
    const isAuth = useCookie("isAuth", {default: () => false})
    const toast = useToast()

    const schema = z.object({
        email: z.string().email("Enter a valid email"),
        password: z.string()
    })

    type Schema = z.output<typeof schema>
    
    const state = reactive({
        email: "",
        password: ""
    })

    const onSubmit = async function (event: FormSubmitEvent<Schema>) {
        
        try {

            const response = await fetch("http://localhost:" + BACK_API_PORT + "/auth/logIn", {
                method: "post",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: event.data.email,
                    password: event.data.password,
                })
            })

            const jsonResponse = await response.json()

            console.log({jsonResponse})

            if(jsonResponse.errorMessage) throw new Error(jsonResponse.errorMessage)

            sessionToken.value = jsonResponse.sessionToken

            isAuth.value = true

            navigateTo("/dashboard")

        }
        catch(err) {

            console.log({err})

            toast.add({
                title: "Error on loging " + err
            })

        }

    }

</script>
  