// src/components/ProjectCard.jsx
import React from "react";

export default function ProjectCard({
  title,
  thumbnail,
  videoUrl,
  subtitle,
  onClick,
  onDelete,   // ✅ 추가: 삭제 콜백 (없으면 버튼 안 보임)
}) {
  return (
    <div
      className="
        relative
        flex flex-col
        h-[260px] w-full
        rounded-2xl bg-white
        shadow-[0_10px_25px_rgba(0,0,0,0.04)]
        hover:shadow-[0_18px_35px_rgba(0,0,0,0.10)]
        transition
        hover:-translate-y-1
        overflow-hidden
      "
    >
      {/* 카드 전체 클릭 → 프로젝트 열기 */}
      <button
        type="button"
        onClick={onClick}
        className="flex-1 flex flex-col text-left"
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

      {/* ❌ 삭제 버튼 (onDelete가 넘어온 경우에만 보이게) */}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // 카드 클릭(onClick) 막기
            onDelete();
          }}
          className="
            absolute top-2 right-2
            w-8 h-8
            flex items-center justify-center
            rounded-full
            bg-white/90 hover:bg-red-50
            border border-gray-200 hover:border-red-300
            text-gray-400 hover:text-red-500
            text-sm
            shadow-sm
          "
          title="Delete project"
        >
          ×
        </button>
      )}
    </div>
  );
}
