# Modal Fixes Instructions

## Issues Fixed

1. Product count is now displayed in both Brand and Category management tables
2. Image display issues in the product catalog have been fixed
3. Non-functional Cancel and X buttons in product add/edit modal popups have been fixed

## Remaining Changes for Brand and Category Management

### BrandManagement.jsx Changes

1. Add the following ESC key handler right after the state declarations:

```jsx
// Add ESC key handler to close modal
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === "Escape" && showForm) {
      resetForm();
    }
  };

  window.addEventListener("keydown", handleEscape);
  return () => {
    window.removeEventListener("keydown", handleEscape);
  };
}, [showForm]);
```

2. Update the modal overlay to close when clicked outside:

```jsx
{/* Brand Form Modal */}
{showForm && (
  <div
    className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    onClick={resetForm}
  >
    <div
      className="relative top-20 mx-auto p-5 border w-[480px] shadow-lg rounded-md bg-white"
      onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the modal when clicking inside
    >
```

### CategoryManagement.jsx Changes

1. Add the following ESC key handler right after the state declarations:

```jsx
// Add ESC key handler to close modal
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === "Escape" && showForm) {
      resetForm();
    }
  };

  window.addEventListener("keydown", handleEscape);
  return () => {
    window.removeEventListener("keydown", handleEscape);
  };
}, [showForm]);
```

2. Update the modal overlay to close when clicked outside:

```jsx
{/* Category Form Modal */}
{showForm && (
  <div
    className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    onClick={resetForm}
  >
    <div
      className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
      onClick={(e) => e.stopPropagation()} // Prevent clicks from closing the modal when clicking inside
    >
```

3. Update the product count display to show badges like in BrandManagement:

```jsx
<td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm text-gray-900">
    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
      {category.productCount || 0}
    </span>
  </div>
</td>
```

These changes will ensure:

1. Modals can be closed by:
   - Clicking the X button
   - Clicking outside the modal
   - Pressing the ESC key
   - Clicking the Cancel button
2. Product counts are displayed consistently in both management sections
