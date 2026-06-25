import { useState } from 'react'
import { useTripStore } from '../store'

function ItemRow({
  categoryId,
  item,
}: {
  categoryId: string | null
  item: { id: string; name: string; checked: boolean }
}) {
  const togglePackingItem = useTripStore((s) => s.togglePackingItem)
  const deletePackingItem = useTripStore((s) => s.deletePackingItem)

  return (
    <li className="packing-item">
      <label className="packing-item-label">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={() => togglePackingItem(categoryId, item.id)}
        />
        <span className={item.checked ? 'packing-item-checked' : ''}>{item.name}</span>
      </label>
      <button
        className="btn-danger"
        onClick={() => deletePackingItem(categoryId, item.id)}
        aria-label={`Delete ${item.name}`}
      >
        ✕
      </button>
    </li>
  )
}

function AddItemForm({ categoryId }: { categoryId: string | null }) {
  const addPackingItem = useTripStore((s) => s.addPackingItem)
  const [name, setName] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    addPackingItem(categoryId, trimmed)
    setName('')
  }

  return (
    <form className="packing-add-form" onSubmit={submit}>
      <input
        value={name}
        placeholder="Add item"
        onChange={(e) => setName(e.target.value)}
      />
      <button className="btn-primary" type="submit">
        + Add
      </button>
    </form>
  )
}

export function PackingListView() {
  const trip = useTripStore((s) => s.trip)
  const addPackingCategory = useTripStore((s) => s.addPackingCategory)
  const renamePackingCategory = useTripStore((s) => s.renamePackingCategory)
  const deletePackingCategory = useTripStore((s) => s.deletePackingCategory)
  const [newCategoryName, setNewCategoryName] = useState('')

  function submitCategory(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    addPackingCategory(trimmed)
    setNewCategoryName('')
  }

  return (
    <div className="packing-list-view">
      <section className="card">
        <h2>Packing list</h2>
        <ul className="packing-item-list">
          {trip.packingList.items.map((item) => (
            <ItemRow key={item.id} categoryId={null} item={item} />
          ))}
        </ul>
        <AddItemForm categoryId={null} />
      </section>

      {trip.packingList.categories.map((category) => (
        <section className="card" key={category.id}>
          <div className="packing-category-header">
            <input
              className="packing-category-title"
              value={category.name}
              placeholder="Category name"
              onChange={(e) => renamePackingCategory(category.id, e.target.value)}
            />
            <button
              className="btn-danger"
              onClick={() => deletePackingCategory(category.id)}
              aria-label={`Delete category ${category.name || 'category'}`}
            >
              Delete category
            </button>
          </div>
          <ul className="packing-item-list">
            {category.items.map((item) => (
              <ItemRow key={item.id} categoryId={category.id} item={item} />
            ))}
          </ul>
          <AddItemForm categoryId={category.id} />
        </section>
      ))}

      <form className="packing-add-category-form" onSubmit={submitCategory}>
        <input
          value={newCategoryName}
          placeholder="New category name"
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button className="btn-primary" type="submit">
          + Add category
        </button>
      </form>
    </div>
  )
}
