import React from "react";

export default function StepBasicInfo({ formData, setFormData, errors }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log(formData);
    
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300">Title</label>
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full bg-gray-800 text-white rounded p-2 mt-1 border border-gray-700"
        />
        {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full bg-gray-800 text-white rounded p-2 mt-1 border border-gray-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Location</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white rounded p-2 mt-1 border border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white rounded p-2 mt-1 border border-gray-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white rounded p-2 mt-1 border border-gray-700"
          >
            <option value="dining">Dining</option>
            <option value="travel">Travel</option>
            <option value="stay">Stay</option>
            <option value="shopping">Shopping</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white rounded p-2 mt-1 border border-gray-700"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
    </div>
  );
}
