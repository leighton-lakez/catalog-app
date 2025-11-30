import CategoryList from '../../components/categories/CategoryList'
import { useCategories } from '../../hooks/useCategories'

export default function Categories() {
  const {
    categories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories()

  return (
    <CategoryList
      categories={categories}
      onCreateCategory={createCategory}
      onUpdateCategory={updateCategory}
      onDeleteCategory={deleteCategory}
      loading={loading}
    />
  )
}
