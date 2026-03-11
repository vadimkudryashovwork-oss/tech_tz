import { useUnit } from 'effector-react'
import { onSubmit } from '@/shared/lib/form'
import { $editorState, editorClosedFn, productForm } from '@/features/products/model'
import { FORM_COLUMNS } from '@/features/products/columns-schema'
import { Button } from '@/shared/ui/Button'
import { FormInput } from '@/shared/ui/FormInput'
import { Modal } from '@/shared/ui/Modal'
import type { ProductFormField } from '@/shared/types/product'

const FORM_PLACEHOLDERS: Record<ProductFormField, string> = {
  title: 'Например, Wireless Mouse',
  brand: 'Например, Logitech',
  sku: 'SKU-001',
  price: '',
}

function ProductFormDialogContent({
  closeEditor,
  buttonText,
}: {
  closeEditor: () => void
  buttonText: string
}) {
  return (
    <form className="product-form" onSubmit={onSubmit(() => productForm.submit())}>
      <div className="product-form__grid">
        {FORM_COLUMNS.map((col) => (
          <FormInput
            key={col.key}
            field={productForm.fields[col.key]}
            name={col.key}
            label={col.formLabel ?? col.label}
            placeholder={FORM_PLACEHOLDERS[col.key] ?? undefined}
            {...(col.key === 'price' ? { type: 'number' as const, min: 0, step: 0.01 } : {})}
          />
        ))}
      </div>
      <div className="product-form__actions">
        <Button variant="secondary" type="button" onClick={closeEditor}>
          Отмена
        </Button>
        <Button type="submit">{buttonText}</Button>
      </div>
    </form>
  )
}

function ProductFormDialog() {
  const [editorState, closeEditor] = useUnit([$editorState, editorClosedFn])

  return (
    <Modal
      isOpen={editorState.isOpen}
      onClose={closeEditor}
      title={editorState.mode === 'edit' ? 'Редактировать товар' : 'Добавить товар'}
      description="Основные поля сохраняются локально, без отправки на API."
    >
      <ProductFormDialogContent
        key={`${editorState.mode}-${editorState.product?.id ?? 'new'}`}
        closeEditor={closeEditor}
        buttonText={editorState.mode === 'edit' ? 'Сохранить' : 'Добавить'}
      />
    </Modal>
  )
}

export { ProductFormDialog }
