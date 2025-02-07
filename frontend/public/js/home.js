$(document).ready(function () {
    let books = [];
    let filters = {
        authors: new Set(),
        genres: new Set(),
        priceRange: [0, 100]
    };

    $.ajax({ 
        type: 'GET', 
        url: 'http://localhost:3001/books', 
        dataType: 'json',
        success: function (data) { 
            books = data;
            setPriceRange();
            populateFilters();
            renderBooks();
        }
    });

    function setPriceRange() {
        const prices = books.map(book => book.price);
        filters.priceRange[0] = Math.min(...prices);
        filters.priceRange[1] = Math.max(...prices);
        $('#price-range').attr('min', filters.priceRange[0]);
        $('#price-range').attr('max', filters.priceRange[1]);
        $('#price-range').val($('#price-range').attr('max'));
        $('#price-value').text(`Up to ${filters.priceRange[1]}`);
    }

    function populateFilters() {
        const authors = new Set(books.map(book => book.author));
        const genres = new Set(books.flatMap(book => book.genre)); 
        
        const authorFilters = $('#author-filters');
        authors.forEach(author => {
            const checkbox = `<label><input type="checkbox" class="author-filter" value="${author}"> ${author}</label><br>`;
            authorFilters.append(checkbox);
        });

        const genreFilters = $('#genre-filters');
        genres.forEach(genre => {
            const checkbox = `<label><input type="checkbox" class="genre-filter" value="${genre}"> ${genre}</label><br>`;
            genreFilters.append(checkbox);
        });

        $('.author-filter').change(function() {
            const author = $(this).val();
            if ($(this).is(':checked')) {
                filters.authors.add(author);
            } else {
                filters.authors.delete(author);
            }
            renderBooks();
        });

        $('.genre-filter').change(function() {
            const genre = $(this).val();
            if ($(this).is(':checked')) {
                filters.genres.add(genre);
            } else {
                filters.genres.delete(genre);
            }
            renderBooks();
        });

        $('#price-range').on('input', function() {
            filters.priceRange[1] = $(this).val();
            $('#price-value').text(`Up to ${filters.priceRange[1]}`);
            renderBooks();
        });
    }

    function renderBooks() {
        let html = '';
        const booksContainer = $('.books-container');

        const filteredBooks = books.filter(book => {
            const matchesAuthor = filters.authors.size === 0 || filters.authors.has(book.author);
            const matchesGenre = filters.genres.size === 0 || book.genre.some(genre => filters.genres.has(genre));
            const matchesPrice = book.price <= filters.priceRange[1];
            return matchesAuthor && matchesGenre && matchesPrice;
        });

        $.each(filteredBooks, function (index, book) { 
            html += `
                <a href="book/${book._id}" class="text-decoration-none col-2 me-4 mb-4">
                    <div class="card book-card h-100">
                        <img src="/api/placeholder/400/300" class="card-img-top" alt="${book.name}">
                        <div class="card-body d-flex flex-column justify-content-between">
                            <h5 class="card-title">${book.name}</h5>
                            <p class="card-text">Author: <span class="book-author">${book.author}</span></p>
                            <p class="card-text">Genres: ${book.genre.join(', ')}</p>
                            <p class="card-text">Year: ${book.publicationYear}</p>
                            <p class="card-text">Pages: ${book.numOfPages}</p>
                            <p class="card-text">Price: $${book.price}</p>
                            <button class="btn btn-primary add-to-cart-btn w-75 align-self-center" data-price=${book.price} data-title="${book.name}" data-author="${book.author}" data-id="${book._id}">Add to Cart</button>

                        </div>
                    </div>
                </a>
            `;
        });
        booksContainer.html(html);
    }

    $("#search-bar").on("keyup", function () {
        let searchTerm = $(this).val().toLowerCase();

        $(".book-card").each(function () {
            let title = $(this).find(".card-title").text().toLowerCase();
            let author = $(this).find(".book-author").text().toLowerCase();

            if (title.includes(searchTerm) || author.includes(searchTerm)) {
                $(this).closest('a').show();  
            } else {
                $(this).closest('a').hide(); 
            }
        });
    });
    $(document).on('click', '.add-to-cart-btn', function (event) {
        event.preventDefault(); 
        event.stopPropagation(); 
        const title = $(this).data('title');
        const author = $(this).data('author');
        const price = $(this).data('price');
        const id = $(this).data('id');

        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        console.log('Cart before adding:', cart);

        cart.push({ title, author, price, id });

        localStorage.setItem('cart', JSON.stringify(cart));

        alert(`${title} added to cart!`);
    });
});
