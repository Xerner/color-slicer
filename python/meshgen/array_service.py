

class ArrayService:
  def replace_value(self, rgba_array, find_value, replace_value):
    for i, value in enumerate(rgba_array):
      if value == find_value:
        rgba_array[i] = replace_value
