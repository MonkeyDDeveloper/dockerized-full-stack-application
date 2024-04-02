<script lang="ts" setup>
import { onMounted, ref } from "vue";
import type { IProduct } from "~/schemas";
import type { ICategory } from "~/schemas";
import type { FormSubmitEvent } from "#ui/types";
import { z } from "zod";

const route = useRoute();
const toast = useToast();
const sessionToken = useCookie("sessionToken");
const isAuth = useCookie("isAuth", {default: () => false});
const productCode = route.params.code;
const product = ref({} as IProduct);
const openPopover = ref(false);
const openEditPopover = ref(false);
const categories = ref([]);
const runtimeConfig = useRuntimeConfig();
const { BACK_API_PORT } = runtimeConfig.public;

const schema = z.object({
  name: z.string().min(1, "Enter a name for the product"),
  code: z.number({ required_error: "Enter a code for the product" }),
  stock: z.number().min(0, "Enter a stock number for the product"),
  measurementType: z.string().min(1, "Select a measurement type"),
  category: z.string().min(1, "Select a category"),
});

type Schema = z.output<typeof schema>;

const state = reactive({
  _id: "",
  name: "",
  code: 0,
  stock: 0,
  measurementType: "",
  category: "",
});

onMounted(async () => {
  try {
    const response = await fetch(
      "http://localhost:" +
        BACK_API_PORT +
        "/products/getAProduct?productCode=" +
        productCode,
      {
        headers: {
          authorization: sessionToken.value,
        },
      }
    );

    const jsonResponse = await response.json();

    console.log({
      jsonResponse,
    });

    if (jsonResponse.errorMessage) throw jsonResponse.errorMessage;

    product.value = jsonResponse.product as IProduct;

    state._id = jsonResponse.product._id;
    state.name = jsonResponse.product.name;
    state.code = jsonResponse.product.code;
    state.stock = jsonResponse.product.stock;
    state.measurementType = jsonResponse.product.measurementType;
    state.category = jsonResponse.product.category;

    console.log({ state });
  } catch (err) {
    toast.add({
      title: "Error getting the product " + err,
    });

    if (/jwt expired/.test(err as string)) {
      isAuth.value = false;

      sessionToken.value = "";

      window.location.href = "/";
    }
  }
});

onMounted(async () => {
  try {
    const response = await fetch(
      "http://localhost:" + BACK_API_PORT + "/products/categories",
      {
        headers: {
          authorization: sessionToken.value,
        },
      }
    );
    const jsonResponse = await response.json();

    if (jsonResponse.errorMessage) throw jsonResponse.errorMessage;

    categories.value = (jsonResponse.categories as ICategory[]).map(
      (categorie) => categorie.name
    );
  } catch (err) {
    toast.add({
      title: "Error getting the categories options " + err,
    });

    if (/jwt expired/.test(err as string)) {
      isAuth.value = false;

      sessionToken.value = "";

      window.location.href = "/";
    }
  }
});

async function deleteProduct() {
  try {
    const response = await fetch(
      "http://localhost:" +
        BACK_API_PORT +
        "/products/deleteAProduct?productCode=" +
        productCode,
      {
        method: "delete",
        headers: {
          authorization: sessionToken.value,
        },
      }
    );

    const jsonResponse = await response.json();

    if (jsonResponse.errorMessage) throw jsonResponse.errorMessage;

    toast.add({
      title: "Product deleted successfully",
    });

    navigateTo("/products");
  } catch (err) {
    toast.add({
      title: "Error deleting the product " + err,
    });

    if (/jwt expired/.test(err as string as string)) {
      isAuth.value = false;

      sessionToken.value = "";

      window.location.href = "/";
    }
  }
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const response = await fetch(
      "http://localhost:" + BACK_API_PORT + "/products/updateAProduct",
      {
        method: "put",
        headers: {
          "content-type": "application/json",
          authorization: sessionToken.value,
        },
        body: JSON.stringify({
          ...event.data,
          hasStock: event.data.stock > 0,
        }),
      }
    );

    const jsonResponse = await response.json();

    if (jsonResponse.errorMessage) throw jsonResponse.errorMessage;

    toast.add({
      title: "Product updated successfully",
    });

    navigateTo("/products");
  } catch (err) {
    toast.add({
      title: "Error updating the product " + err,
    });

    if (/jwt expired/.test(err as string)) {
      isAuth.value = false;

      sessionToken.value = "";

      window.location.href = "/";
    }
  }
}
</script>
<template>
  <UContainer class="mt-4 p-4">
    <UButton
      to="/products"
      color="blue"
      label="⬅️ Products"
      class="justify-center"
    />
  </UContainer>

  <UContainer class="mt-4 p-4">
    <section v-if="product.code">
      <UCard>
        <template #header>
          <section class="flex flex-wrap justify-end">
            <UButton class="mb-3" :to="`/products/history/${productCode}`">
              <UIcon name="i-heroicons-clock" />
            </UButton>

            <h2 class="w-full text-2xl font-extrabold">{{ product.name }}</h2>
          </section>
        </template>

        <section>
          <h3 class="text-xl font-extrabold">Product features</h3>

          <h5 class="text-lg font-normal">
            Product code: <span class="font-extrabold">{{ product.code }}</span>
          </h5>
          <h5 class="text-lg font-normal">
            Product stock:
            <span class="font-extrabold">{{ product.stock }}</span>
          </h5>
          <h5 class="text-lg font-normal">
            Product has stock:
            <span class="font-extrabold">{{ product.hasStock }}</span>
          </h5>
          <h5 class="text-lg font-normal">
            Product measuring type:
            <span class="font-extrabold">{{ product.measurementType }}</span>
          </h5>
          <h5 class="text-lg font-normal">
            Product category:
            <span class="font-extrabold">{{ product.category }}</span>
          </h5>
        </section>

        <template #footer>
          <section class="flex justify-between">
            <UButton
              @click="openEditPopover = true"
              color="cyan"
              class="w-[40%] justify-center"
              >Edit
            </UButton>

            <UButton
              @click="openPopover = true"
              color="red"
              class="justify-center"
              >Delete</UButton
            >
          </section>
        </template>
      </UCard>
    </section>
  </UContainer>

  <UModal v-model="openPopover" prevent-close>
    <UCard
      :ui="{
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h3
            class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
          >
            You are going to delete
          </h3>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="openPopover = false"
          />
        </div>
      </template>

      <UButton @click="deleteProduct" class="w-full justify-center" color="red"
        >Confirm delete {{ product.name }}
      </UButton>
    </UCard>
  </UModal>

  <UModal v-model="openEditPopover">
    <UCard
      :ui="{
        ring: '',
        divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      }"
    >
      <UForm :state="state" :schema="schema" @submit="onSubmit">
        <UFormGroup class="mt-2" label="Name" name="name">
          <UInput type="string" v-model="state.name" />
        </UFormGroup>

        <UFormGroup class="mt-2" label="Code" name="code">
          <UInput type="number" v-model="state.code" />
        </UFormGroup>

        <UFormGroup class="mt-2" label="Stock" name="stock">
          <UInput type="number" v-model="state.stock" />
        </UFormGroup>

        <UFormGroup class="mt-2" label="Measurement" name="measurementType">
          <USelect
            v-model="state.measurementType"
            color="primary"
            variant="outline"
            :options="['lb', 'Kg']"
          />
        </UFormGroup>

        <UFormGroup class="mt-2" label="Category" name="category">
          <USelect
            v-model="state.category"
            color="primary"
            variant="outline"
            :options="categories"
          />
        </UFormGroup>

        <UButton class="mt-2" type="submit"> Update product </UButton>
      </UForm>
    </UCard>
  </UModal>
</template>
