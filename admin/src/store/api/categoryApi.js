import { baseApi } from "./baseApi";

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // flat: true zaroori hai — bina iske backend nested tree deta hai jismein
    // pagination ka koi matlab nahi hota (aadhi tree se rishtay toot jate hain).
    getCategories: builder.query({
      query: (params = {}) => ({ url: "/categories", params: { flat: true, ...params } }),
      providesTags: [{ type: "Category", id: "LIST" }],
    }),

    /**
     * body do shakal mein aa sakta hai:
     *   FormData  -> jab naya image upload ho raha ho (multipart)
     *   plain obj -> jab sirf text fields badle hain (JSON)
     * fetchBaseQuery dono ko sahi handle karta hai; multer JSON requests ko
     * chhoo kar aage bhej deta hai. JSON wala raasta is liye chahiye ke
     * parentCategory ko null karna sirf real null se hota hai — multipart mein
     * sab kuch string hota hai aur khali string par mongoose CastError deta hai.
     */
    createCategory: builder.mutation({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

    updateCategory: builder.mutation({
      query: ({ id, body }) => ({ url: `/categories/${id}`, method: "PATCH", body }),
      invalidatesTags: [{ type: "Category", id: "LIST" }, { type: "Product", id: "LIST" }],
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Category", id: "LIST" }, { type: "Product", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
