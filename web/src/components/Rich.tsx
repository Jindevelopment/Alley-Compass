import { Fragment } from "react";

import type { RichParts } from "@/lib/rich";

/** rich.ts 의 조각 배열을 렌더한다. 문자열은 그대로, b(...) 는 강조로. */
export function Rich({ parts }: { parts: RichParts }) {
  return (
    <>
      {parts.map((part, i) =>
        typeof part === "string" ? (
          <Fragment key={i}>{part}</Fragment>
        ) : (
          <b key={i} className="font-semibold">
            {part.bold}
          </b>
        ),
      )}
    </>
  );
}
