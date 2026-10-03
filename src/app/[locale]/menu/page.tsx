                                            "
                                          >
                                            {
                                              copy
                                                .available
                                            }
                                          </span>
                                        </div>
                                      </article>
                                    ),
                                  )
                              }
                            </div>
                          </section>
                        ),
                      )
                    }
                  </div>
                </div>
              </section>
            )
          : null
      }


      {/* ====================================================
          CONVERSION
          ==================================================== */}

      <section
        className="
          bg-[#123d73]
          py-16
          text-white
          sm:py-20
        "
      >
        <div
          className="
            site-container
            grid
            gap-8
            lg:grid-cols-[1fr_auto]
            lg:items-center
          "
        >
          <div>
            <h2
              className="
                max-w-3xl
                font-serif
                text-3xl
                font-bold
                sm:text-4xl
              "
            >
              {copy.footerTitle}
            </h2>

            <p
              className="
                mt-4
                max-w-2xl
                text-base
                leading-7
                text-white/70
              "
            >
              {copy.footerDescription}
            </p>
          </div>

          <a
            href={
              orderHref
            }
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex
              min-h-12
              items-center
              justify-center
              rounded-full
              bg-[#f7c600]
              px-7
              text-sm
              font-black
              text-[#12100e]
              shadow-lg
              transition
              hover:-translate-y-0.5
            "
          >
            {copy.footerAction}
            <span
              className="ml-2"
              aria-hidden="true"
            >
              →
            </span>
          </a>
        </div>
      </section>


      {/* ====================================================
          COLOMBIAN BRAND STRIPE
          ==================================================== */}

      <div
        className="
          grid
          h-3
          grid-cols-[2fr_1fr_1fr]
        "
        aria-hidden="true"
      >
        <div className="bg-[#f7c600]" />
        <div className="bg-[#123d73]" />
        <div className="bg-[#c92d39]" />
      </div>
    </main>
  );
}
