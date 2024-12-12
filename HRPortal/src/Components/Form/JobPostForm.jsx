import React from 'react'

function JobPostForm() {
  return (
    <div>
      <div className="flex min-h-full flex-1 flex-col justify-center px-2 py-2 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">

          <h1 className="mt-10 text-center text-4xl/6 font-bold tracking-tight text-gray-900">
            Post new Job
          </h1>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6">
            <div className>
              <div className='flex items-center justify-between'>
                <label htmlFor="job-title" className="block text-m/6 font-medium text-gray-900">
                  Job Title
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="job-title"
                  name="job-title"
                  type="text"
                  required
                  autoComplete="job-title"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="job-location" className="block text-m/6 font-medium text-gray-900">
                  Job Location
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="job-location"
                  name="job-location"
                  type="text"
                  required
                  autoComplete="job-location"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="job-Description" className="block text-m/6 font-medium text-gray-900">
                  Job Description
                </label>
              </div>
              <div className="mt-2">
                <textarea
                  id="job-description"
                  name="job-description"
                  type="text"
                  required
                  autoComplete="job-description"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Post Job
              </button>
            </div>
          </form>


        </div>
        <h1 style={{ 'margin-top': '12vh', 'margin-bottom': '6vh' }} className="mt-10 text-center text-4xl/6 font-bold tracking-tight text-gray-900">
          Existing Jobs
        </h1>
        <div className='existing-job-grid'>
          <div className='existing-job-card'>
            <h1 className="mt-4 text-center text-3xl/6 font-bold tracking-tight text-gray-900">
              Job Title
            </h1>
            <div className='existing-job-location'>
              Job locations,locations
            </div>
            <div className='existing-job-description'>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga quisquam deserunt eligendi architecto quia accusamus ducimus. Excepturi quae commodi qui cupiditate, distinctio soluta incidunt, voluptatem obcaecati quod quos natus sequi voluptatum quo optio quia aliquam veniam doloremque consequuntur praesentium consequatur? Ipsam aliquam tenetur eius deleniti doloribus nesciunt ratione repudiandae corrupti?
            </div>
          </div>
          <div className='existing-job-card'>
            <h1 className="mt-4 text-center text-3xl/6 font-bold tracking-tight text-gray-900">
              Job Title
            </h1>
            <div className='existing-job-location'>
              Job locations,locations
            </div>
            <div className='existing-job-description'>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga quisquam deserunt eligendi architecto quia accusamus ducimus. Excepturi quae commodi qui cupiditate, distinctio soluta incidunt, voluptatem obcaecati quod quos natus sequi voluptatum quo optio quia aliquam veniam doloremque consequuntur praesentium consequatur? Ipsam aliquam tenetur eius deleniti doloribus nesciunt ratione repudiandae corrupti?
            </div>
          </div>
          <div className='existing-job-card'>
            <h1 className="mt-4 text-center text-3xl/6 font-bold tracking-tight text-gray-900">
              Job Title
            </h1>
            <div className='existing-job-location'>
              Job locations,locations
            </div>
            <div className='existing-job-description'>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga quisquam deserunt eligendi architecto quia accusamus ducimus. Excepturi quae commodi qui cupiditate, distinctio soluta incidunt, voluptatem obcaecati quod quos natus sequi voluptatum quo optio quia aliquam veniam doloremque consequuntur praesentium consequatur? Ipsam aliquam tenetur eius deleniti doloribus nesciunt ratione repudiandae corrupti?
            </div>
          </div>
          <div className='existing-job-card'>
            <h1 className="mt-4 text-center text-3xl/6 font-bold tracking-tight text-gray-900">
              Job Title
            </h1>
            <div className='existing-job-location'>
              Job locations,locations
            </div>
            <div className='existing-job-description'>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga quisquam deserunt eligendi architecto quia accusamus ducimus. Excepturi quae commodi qui cupiditate, distinctio soluta incidunt, voluptatem obcaecati quod quos natus sequi voluptatum quo optio quia aliquam veniam doloremque consequuntur praesentium consequatur? Ipsam aliquam tenetur eius deleniti doloribus nesciunt ratione repudiandae corrupti?
            </div>
          </div>
        </div>



        <div id="default-carousel" class="relative w-full" data-carousel="slide">
          {/* <!-- Carousel wrapper --> */}
          <div class="relative h-56 overflow-hidden rounded-lg md:h-96">
            {/* <!-- Item 1 --> */}
            <div class="hidden duration-700 ease-in-out" data-carousel-item>
              <div className='existing-job-card absolute block w-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2'>
                <h1 className="mt-4 text-center text-3xl/6 font-bold tracking-tight text-gray-900">
                  Job Title
                </h1>
                <div className='existing-job-location'>
                  Job locations,locations
                </div>
                <div className='existing-job-description'>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga quisquam deserunt eligendi architecto quia accusamus ducimus. Excepturi quae commodi qui cupiditate, distinctio soluta incidunt, voluptatem obcaecati quod quos natus sequi voluptatum quo optio quia aliquam veniam doloremque consequuntur praesentium consequatur? Ipsam aliquam tenetur eius deleniti doloribus nesciunt ratione repudiandae corrupti?
                </div>
              </div>
            </div>
            {/* <!-- Item 2 --> */}
            <div class="hidden duration-700 ease-in-out" data-carousel-item>
              <div className='existing-job-card'>
                <h1 className="mt-4 text-center text-3xl/6 font-bold tracking-tight text-gray-900">
                  Job Title
                </h1>
                <div className='existing-job-location'>
                  Job locations,locations
                </div>
                <div className='existing-job-description'>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga quisquam deserunt eligendi architecto quia accusamus ducimus. Excepturi quae commodi qui cupiditate, distinctio soluta incidunt, voluptatem obcaecati quod quos natus sequi voluptatum quo optio quia aliquam veniam doloremque consequuntur praesentium consequatur? Ipsam aliquam tenetur eius deleniti doloribus nesciunt ratione repudiandae corrupti?
                </div>
              </div>            </div>
            {/* <!-- Item 3 --> */}
            <div class="hidden duration-700 ease-in-out" data-carousel-item>
              <div className='existing-job-card'>
                <h1 className="mt-4 text-center text-3xl/6 font-bold tracking-tight text-gray-900">
                  Job Title
                </h1>
                <div className='existing-job-location'>
                  Job locations,locations
                </div>
                <div className='existing-job-description'>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga quisquam deserunt eligendi architecto quia accusamus ducimus. Excepturi quae commodi qui cupiditate, distinctio soluta incidunt, voluptatem obcaecati quod quos natus sequi voluptatum quo optio quia aliquam veniam doloremque consequuntur praesentium consequatur? Ipsam aliquam tenetur eius deleniti doloribus nesciunt ratione repudiandae corrupti?
                </div>
              </div>            </div>
            {/* <!-- Item 4 --> */}
            <div class="hidden duration-700 ease-in-out" data-carousel-item>
              <div className='existing-job-card'>
                <h1 className="mt-4 text-center text-3xl/6 font-bold tracking-tight text-gray-900">
                  Job Title
                </h1>
                <div className='existing-job-location'>
                  Job locations,locations
                </div>
                <div className='existing-job-description'>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga quisquam deserunt eligendi architecto quia accusamus ducimus. Excepturi quae commodi qui cupiditate, distinctio soluta incidunt, voluptatem obcaecati quod quos natus sequi voluptatum quo optio quia aliquam veniam doloremque consequuntur praesentium consequatur? Ipsam aliquam tenetur eius deleniti doloribus nesciunt ratione repudiandae corrupti?
                </div>
              </div>            </div>
            {/* <!-- Item 5 --> */}
            <div class="hidden duration-700 ease-in-out" data-carousel-item>
              <div className='existing-job-card'>
                <h1 className="mt-4 text-center text-3xl/6 font-bold tracking-tight text-gray-900">
                  Job Title
                </h1>
                <div className='existing-job-location'>
                  Job locations,locations
                </div>
                <div className='existing-job-description'>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga quisquam deserunt eligendi architecto quia accusamus ducimus. Excepturi quae commodi qui cupiditate, distinctio soluta incidunt, voluptatem obcaecati quod quos natus sequi voluptatum quo optio quia aliquam veniam doloremque consequuntur praesentium consequatur? Ipsam aliquam tenetur eius deleniti doloribus nesciunt ratione repudiandae corrupti?
                </div>
              </div>            </div>
          </div>
          {/* <!-- Slider indicators --> */}
          <div class="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3 rtl:space-x-reverse">
            <button type="button" class="w-3 h-3 rounded-full" aria-current="true" aria-label="Slide 1" data-carousel-slide-to="0"></button>
            <button type="button" class="w-3 h-3 rounded-full" aria-current="false" aria-label="Slide 2" data-carousel-slide-to="1"></button>
            <button type="button" class="w-3 h-3 rounded-full" aria-current="false" aria-label="Slide 3" data-carousel-slide-to="2"></button>
            <button type="button" class="w-3 h-3 rounded-full" aria-current="false" aria-label="Slide 4" data-carousel-slide-to="3"></button>
            <button type="button" class="w-3 h-3 rounded-full" aria-current="false" aria-label="Slide 5" data-carousel-slide-to="4"></button>
          </div>
          {/* <!-- Slider controls --> */}
          <button type="button" class="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" data-carousel-prev>
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
              <svg class="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4" />
              </svg>
              <span class="sr-only">Previous</span>
            </span>
          </button>
          <button type="button" class="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none" data-carousel-next>
            <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
              <svg class="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
              </svg>
              <span class="sr-only">Next</span>
            </span>
          </button>
        </div>

      </div>
    </div>
  )
}

export default JobPostForm