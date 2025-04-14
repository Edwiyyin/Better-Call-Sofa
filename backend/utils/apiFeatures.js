// Pagination utility function
exports.paginate = (data, page, limit) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = data.length;
    
    // Pagination result
    const pagination = {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    };
    
    // Add next page if available
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    // Add previous page if available
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    // Return paginated data
    return {
      pagination,
      data: data.slice(startIndex, endIndex)
    };
  };
  
  // Filter products by search term
  exports.search = (products, term) => {
    if (!term) return products;
    
    const searchRegex = new RegExp(term, 'i');
    
    return products.filter(product => {
      return (
        searchRegex.test(product.name) ||
        searchRegex.test(product.description) ||
        searchRegex.test(product.category)
      );
    });
  };