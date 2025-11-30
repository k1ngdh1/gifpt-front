// src/components/ProjectCard.jsx
import React from "react";

// src/components/ProjectCard.jsx
export default function ProjectCard({
  title,
  thumbnail,
  videoUrl,     // ✅ 새로 추가
  subtitle,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex flex-col
        h-[260px] w-full
        rounded-2xl bg-white
        shadow-[0_10px_25px_rgba(0,0,0,0.04)]
        hover:shadow-[0_18px_35px_rgba(0,0,0,0.10)]
        transition
        hover:-translate-y-1
        text-left
        overflow-hidden
      "
    >
      {/* 썸네일 영역 */}
      <div className="w-full h-[160px] bg-gray-100 overflow-hidden">
        {videoUrl ? (
          // 🎬 videoUrl 이 있으면 비디오 미리보기
          <video
            src={videoUrl}
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            // hover 할 때만 재생하고 싶으면:
            onMouseOver={(e) => e.currentTarget.play()}
            onMouseOut={(e) => e.currentTarget.pause()}
          />
        ) : (
          // 없으면 기존 이미지 썸네일
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* 텍스트 영역 */}
      <div className="flex-1 px-4 py-3">
        <h3 className="font-semibold text-[16px] text-[#111827] line-clamp-1">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-[13px] text-[#6B7280] line-clamp-2">
            {subtitle}
          </p>
        )}
      </div>
    </button>
  );
}
