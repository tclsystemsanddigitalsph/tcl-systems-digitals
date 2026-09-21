type TCLMarkProps = {
  className?: string;
  title?: string;
};

export default function TCLMark({
  className,
  title = "TCL",
}: TCLMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 128 128"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>

      {/*
        Compact intertwined TCL monogram.
        The letters themselves create the near-square footprint:
        no frame, no background, no artificial closing shapes.
      */}

      {/* C — broad outer sweep */}
      <path
        d="
          M94 34
          C86 23 73 18 58 19
          C35 20 20 38 20 64
          C20 90 35 108 58 109
          C73 110 86 104 95 93
          C87 100 78 103 68 102
          C51 100 41 85 41 64
          C41 43 51 28 68 26
          C78 25 87 28 94 34
          Z
        "
        fill="currentColor"
      />

      {/* T — wide crown and tapered central stem */}
      <path
        d="
          M27 25
          C43 19 61 18 78 22
          C91 17 105 18 113 24
          C118 28 117 34 112 37
          C106 40 98 36 90 32
          C84 29 79 27 74 27

          C69 40 65 53 62 67
          C59 81 57 94 59 105
          C60 111 63 115 68 118
          C57 117 51 112 50 104
          C48 92 51 78 55 63
          C58 50 62 38 67 27

          C52 24 39 26 29 32
          Z
        "
        fill="currentColor"
      />

      {/* L — narrow upright interlocked with the C */}
      <path
        d="
          M76 35
          C83 34 89 35 94 38
          C89 41 87 47 87 55
          V94
          C87 101 84 106 80 109

          H101
          C108 109 113 106 117 100
          C116 110 110 116 101 118
          H70
          C76 113 78 107 78 98
          V55
          C78 47 79 40 76 35
          Z
        "
        fill="currentColor"
      />

      {/* Fine C terminal for the calligraphic contrast */}
      <path
        d="M94 93 C101 89 106 83 109 76"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Restrained T crown flourish */}
      <path
        d="
          M73 25
          C86 18 100 19 109 24
          C114 27 114 31 110 33
          C105 36 98 32 91 29
          C84 26 78 25 73 25
        "
        fill="currentColor"
      />

      {/* Small weave cut at the crossing */}
      <path
        d="M76 57 C81 54 86 54 90 56"
        fill="none"
        stroke="var(--tcl-mark-cut, #161315)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
